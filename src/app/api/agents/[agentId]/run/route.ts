import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  streamAgent,
  buildAgentContext,
  selectModel,
  getPreviousAgentCodes,
} from "@/lib/agents/engine"
import { loadAgentPrompt, getPipelineInstructions } from "@/lib/agents/prompts"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId: agentCode } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await request.json()
  const { message, projectId, runId, isArtifactRequest } = body

  if (!message || !projectId) {
    return new Response("Missing message or projectId", { status: 400 })
  }

  // FIX #8: Check subscription limits
  const { data: projectData } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .single()

  if (projectData) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("workspace_id", projectData.workspace_id)
      .single()

    if (!subscription || subscription.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Нет активной подписки. Оформите тариф." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check if period expired
    if (new Date(subscription.current_period_end) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Подписка истекла. Продлите тариф." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check monthly usage limits
    const limits: Record<string, number> = {
      starter: 30,
      pro: 100,
      premium: 300,
    }
    const monthlyLimit = limits[subscription.plan] || 30

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from("agent_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("started_at", monthStart.toISOString())

    if (count !== null && count >= monthlyLimit) {
      return new Response(
        JSON.stringify({
          error: `Лимит запусков исчерпан (${count}/${monthlyLimit}). Перейдите на более высокий тариф.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      )
    }
  }

  // Get agent definition from DB
  const { data: agent } = await supabase
    .from("agent_definitions")
    .select("*")
    .eq("code", agentCode)
    .single()

  if (!agent) {
    return new Response("Agent not found", { status: 404 })
  }

  // Get knowledge files
  const { data: knowledgeFiles } = await supabase
    .from("agent_knowledge_files")
    .select("parsed_text")
    .eq("agent_id", agent.id)

  // ═══ PIPELINE: Get artifacts from PREVIOUS agents only ═══
  const previousAgentCodes = getPreviousAgentCodes(agentCode)
  let previousArtifacts: Array<{
    type: string
    title: string
    content_md: string
  }> = []

  if (previousAgentCodes.length > 0) {
    // Get agent IDs for previous agents
    const { data: prevAgentDefs } = await supabase
      .from("agent_definitions")
      .select("id, code")
      .in("code", previousAgentCodes)

    if (prevAgentDefs && prevAgentDefs.length > 0) {
      const prevAgentIds = prevAgentDefs.map((a) => a.id)

      const { data: artifacts } = await supabase
        .from("artifacts")
        .select("type, title, content_md, agent_id")
        .eq("project_id", projectId)
        .in("agent_id", prevAgentIds)
        .order("created_at", { ascending: true })

      previousArtifacts = artifacts || []
    }
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, niche, bio")
    .eq("id", user.id)
    .single()

  // ═══ Get or create run ═══
  let currentRunId = runId
  const isFirstMessage = !runId // No existing run = first message

  if (!currentRunId) {
    const { data: newRun } = await supabase
      .from("agent_runs")
      .insert({
        project_id: projectId,
        agent_id: agent.id,
        user_id: user.id,
        status: "running",
        input_context: { firstMessage: message },
      })
      .select("id")
      .single()

    currentRunId = newRun?.id
  }

  // Save user message
  await supabase.from("agent_messages").insert({
    run_id: currentRunId,
    role: "user",
    content: message,
  })

  // ═══ ДВУХФАЗНАЯ СИСТЕМА: полный промпт vs краткое напоминание ═══
  //
  // Фаза 1 (isFirstMessage = true):
  //   Полный промпт из файла (~15-90KB) + pipeline context
  //   Токенов: ~5000-20000 на system prompt
  //
  // Фаза 2 (isFirstMessage = false):
  //   Краткое напоминание роли (~200 токенов)
  //   История чата уже содержит весь контекст
  //   ЭКОНОМИЯ: ~80% входных токенов
  //

  // Load full prompt from file (only used in Phase 1)
  const fullPrompt = isFirstMessage
    ? loadAgentPrompt(agentCode)
    : ""
  const pipelineInstructions = isFirstMessage
    ? getPipelineInstructions(agentCode)
    : ""

  const systemMessages = buildAgentContext(
    agentCode,
    fullPrompt,
    pipelineInstructions,
    (knowledgeFiles?.map((f) => f.parsed_text).filter(Boolean) as string[]) ||
      [],
    previousArtifacts,
    profile || undefined,
    isFirstMessage
  )

  // Get chat history for this run
  const { data: chatHistory } = await supabase
    .from("agent_messages")
    .select("role, content")
    .eq("run_id", currentRunId)
    .order("created_at", { ascending: true })

  // Build messages array: system + chat history
  const messages = [
    ...systemMessages,
    ...((chatHistory?.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }))) || []),
  ]

  // Select model: Sonnet for chat, Opus for artifact generation
  const model = selectModel(!!isArtifactRequest)
  const settings =
    (agent.settings as { temperature?: number; max_tokens?: number }) || {}

  try {
    // Stream response
    const stream = await streamAgent(messages, {
      model,
      temperature: settings.temperature || 0.7,
      maxTokens: settings.max_tokens || 4096,
    })

    // Transform stream to collect full response for saving
    let fullContent = ""

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk)
        const text = new TextDecoder().decode(chunk)
        const lines = text.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6))
              const delta = data.choices?.[0]?.delta?.content
              if (delta) fullContent += delta
            } catch {
              // Skip parse errors
            }
          }
        }
      },
      async flush() {
        // Save assistant message
        if (fullContent && currentRunId) {
          await supabase.from("agent_messages").insert({
            run_id: currentRunId,
            role: "assistant",
            content: fullContent,
          })
        }
      },
    })

    const responseStream = stream.pipeThrough(transformStream)

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Run-Id": currentRunId || "",
      },
    })
  } catch (error) {
    // Mark run as failed
    if (currentRunId) {
      await supabase
        .from("agent_runs")
        .update({
          status: "failed",
          error_message: String(error),
          finished_at: new Date().toISOString(),
        })
        .eq("id", currentRunId)
    }

    return new Response(JSON.stringify({ error: "Failed to run agent" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
