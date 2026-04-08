import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  streamAgent,
  buildAgentContext,
  selectModel,
  getPreviousAgentCodes,
} from "@/lib/agents/engine"
import { loadAgentPrompt, getPipelineInstructions } from "@/lib/agents/prompts"
import { trackEvent } from "@/lib/analytics/track"

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
  let { message, projectId, runId, isArtifactRequest } = body
  const initialGreeting: string | undefined = body.initialGreeting

  if (!message || !projectId) {
    return new Response("Missing message or projectId", { status: 400 })
  }

  // Auto-greeting: agent sends first message to introduce itself
  const isAutoGreeting = message === "__auto_greeting__"
  if (isAutoGreeting) {
    const greetings: Record<string, string> = {
      unpacker: "Привет! Начнём распаковку. Расскажи мне о себе: кто ты, чем занимаешься и как давно в этой сфере? Отвечай подробно — это поможет мне глубже понять твою экспертность.",
      methodologist: "Привет! Я изучил результаты твоей распаковки. Давай создадим продукт на основе твоей экспертизы. Для начала расскажи: какой формат продукта тебе ближе — курс, менторинг, консалтинг? И какой результат должен получить твой клиент?",
      promotion: "Привет! Я вижу твой продукт и позиционирование. Давай создадим контент-стратегию. Скажи, на каких площадках ты сейчас присутствуешь? Instagram, Telegram, YouTube, другие?",
      warmup: "Привет! На основе твоего продукта и контент-стратегии построим прогрев аудитории. Расскажи: ты планируешь запуск к конкретной дате или хочешь вечнозелёную систему прогрева?",
      leadmagnet: "Привет! Я изучил все предыдущие этапы. Давай создадим лид-магниты и воронку. Какой бесплатный материал ты мог бы дать аудитории, чтобы показать свою экспертизу? Может, чек-лист, гайд, мини-курс?",
      sales: "Привет! На основе всех предыдущих этапов создам скрипты продаж. Скажи, как ты сейчас продаёшь — через переписку, созвоны, или и то и другое? И какой средний чек?",
      tracker: "Привет! Я проанализировал весь твой путь от распаковки до продаж. Давай создам конкретный план действий на ближайшую неделю. Что из предыдущих этапов ты уже начал внедрять?",
    }
    message = greetings[agentCode] || "Привет! Давай начнём работу."
    // For auto-greeting, the agent should respond as if the user asked to start
    // We'll use a special system instruction
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

    const hasActiveSub = subscription
      && subscription.status === "active"
      && new Date(subscription.current_period_end) > new Date()

    // ── FREEMIUM: Allow 1 free Unpacker run without subscription ──
    if (!hasActiveSub) {
      if (agentCode === "unpacker") {
        // Check if user already used free Unpacker run
        const { count: existingRuns } = await supabase
          .from("agent_runs")
          .select("id", { count: "exact", head: true })
          .eq("project_id", projectId)
          .eq("user_id", user.id)

        // Allow first run (auto-greeting creates the run, so allow up to 1 existing)
        if (existingRuns !== null && existingRuns > 1) {
          return new Response(
            JSON.stringify({
              error: "Бесплатная распаковка использована. Оформите тариф для продолжения.",
              upsell: true,
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          )
        }
        // else: allow free Unpacker run — skip subscription checks
      } else {
        return new Response(
          JSON.stringify({
            error: "Нет активной подписки. Оформите тариф для доступа к агенту.",
            upsell: true,
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        )
      }
    } else {
      // Has active subscription — check project limits
      const projectLimits: Record<string, number> = {
        starter: 1,
        pro: 3,
        premium: 5,
      }
      const maxProjects = projectLimits[subscription!.plan] || 1

      const { count: projectCount } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", projectData.workspace_id)

      if (projectCount !== null && projectCount > maxProjects) {
        return new Response(
          JSON.stringify({
            error: `Лимит проектов исчерпан (${projectCount}/${maxProjects}). Перейдите на более высокий тариф.`,
            upsell: true,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        )
      }
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

    // Persist the pre-written instant greeting as the first assistant message
    // so the user sees it in history after reload.
    if (currentRunId && initialGreeting) {
      await supabase.from("agent_messages").insert({
        run_id: currentRunId,
        role: "assistant",
        content: initialGreeting,
      })
    }
  }

  // Save user message (skip for auto-greeting — agent speaks first)
  if (!isAutoGreeting) {
    await supabase.from("agent_messages").insert({
      run_id: currentRunId,
      role: "user",
      content: message,
    })
  }

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
  const allMessages = [
    ...systemMessages,
    ...((chatHistory?.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }))) || []),
  ]

  // For auto-greeting, add instruction to introduce yourself
  if (isAutoGreeting) {
    allMessages.push({
      role: "user" as const,
      content: "Представься и задай первый вопрос чтобы начать работу. Будь дружелюбным, кратким. Задай 1-2 конкретных вопроса.",
    })
  }

  const messages = allMessages

  // Track agent message
  if (!isAutoGreeting) {
    trackEvent(supabase, "agent_message_sent", { agent: agentCode }, projectData?.workspace_id)
  }

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

    // Transform stream to collect full response for saving.
    // IMPORTANT: single TextDecoder with { stream: true } to preserve incomplete
    // multi-byte UTF-8 sequences across chunks (fixes Cyrillic typos like "эоципиальная").
    // Also buffer incomplete SSE lines across chunks.
    let fullContent = ""
    const decoder = new TextDecoder("utf-8")
    let lineBuffer = ""

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk)
        lineBuffer += decoder.decode(chunk, { stream: true })
        const lines = lineBuffer.split("\n")
        lineBuffer = lines.pop() || "" // keep incomplete tail for next chunk
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") continue
          try {
            const data = JSON.parse(trimmed.slice(6))
            const delta = data.choices?.[0]?.delta?.content
            if (delta) fullContent += delta
          } catch {
            // Skip parse errors
          }
        }
      },
      async flush() {
        // Flush any remaining buffered line
        lineBuffer += decoder.decode()
        if (lineBuffer.trim().startsWith("data: ") && lineBuffer.trim() !== "data: [DONE]") {
          try {
            const data = JSON.parse(lineBuffer.trim().slice(6))
            const delta = data.choices?.[0]?.delta?.content
            if (delta) fullContent += delta
          } catch { /* skip */ }
        }

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
