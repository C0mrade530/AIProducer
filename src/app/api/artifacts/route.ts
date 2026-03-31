import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyProjectAccess } from "@/lib/auth/project-access"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { artifactCreateSchema } from "@/lib/validations"
import { extractTasksFromArtifact } from "@/lib/tasks/extract"
import { sendTaskReminder, sendStageComplete } from "@/lib/telegram/bot"
import { AGENTS } from "@/lib/agents/constants"

/**
 * POST /api/artifacts — сохранить артефакт из чата агента
 *
 * Body:
 *   projectId: string
 *   agentCode: string
 *   runId: string
 *   title: string
 *   type: string (identity_profile, offer, content_plan, etc.)
 *   contentMd: string (markdown content)
 *   contentJson?: object (structured data)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate limit
  const rl = checkRateLimit(`artifact:${user.id}`, RATE_LIMITS.artifactSave)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    })
  }

  const body = await request.json()
  const parsed = artifactCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { projectId, agentCode, runId, title, type, contentMd, contentJson } =
    parsed.data

  // Verify user has access to the project
  const workspaceId = await verifyProjectAccess(supabase, user.id, projectId)
  if (!workspaceId) {
    return NextResponse.json(
      { error: "Project not found or access denied" },
      { status: 403 }
    )
  }

  // Get agent definition ID
  const { data: agent } = await supabase
    .from("agent_definitions")
    .select("id")
    .eq("code", agentCode)
    .single()

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Save artifact
  const { data: artifact, error } = await supabase
    .from("artifacts")
    .insert({
      project_id: projectId,
      agent_id: agent.id,
      run_id: runId || null,
      type: type || agentCode + "_output",
      title,
      content_md: contentMd,
      content_json: contentJson || {},
      status: "final",
    })
    .select()
    .single()

  if (error) {
    console.error("Artifact save error:", error)
    return NextResponse.json(
      { error: "Failed to save artifact" },
      { status: 500 }
    )
  }

  // Save first version
  await supabase.from("artifact_versions").insert({
    artifact_id: artifact.id,
    version: 1,
    content_md: contentMd,
    content_json: contentJson || {},
  })

  // Update project current_step to next agent
  const { data: agentDef } = await supabase
    .from("agent_definitions")
    .select("step_order")
    .eq("code", agentCode)
    .single()

  if (agentDef) {
    const nextStep = Math.min(agentDef.step_order + 1, 7)
    // Only advance if current step matches this agent
    await supabase
      .from("projects")
      .update({ current_step: nextStep })
      .eq("id", projectId)
      .lte("current_step", agentDef.step_order)
  }

  // Mark agent run as completed
  if (runId) {
    await supabase
      .from("agent_runs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId)
  }

  // Log usage event
  const { data: project } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .single()

  if (project) {
    await supabase.from("usage_events").insert({
      workspace_id: project.workspace_id,
      event_type: "artifact_created",
      metadata: {
        agent_code: agentCode,
        artifact_id: artifact.id,
        artifact_type: type,
      },
    })
  }

  // ═══ AUTO-CREATE TASKS FROM ARTIFACT ═══
  // Extract actionable tasks from artifact content using AI
  // Works for all agents, but tracker agent produces the most tasks
  try {
    const extractedTasks = await extractTasksFromArtifact(contentMd, agentCode)

    if (extractedTasks.length > 0) {
      const now = new Date()
      const tasksToInsert = extractedTasks.map((t) => ({
        project_id: projectId,
        title: t.title,
        description: t.description || null,
        status: "pending",
        priority: t.priority || 2,
        due_at: t.due_days
          ? new Date(now.getTime() + t.due_days * 86400000).toISOString()
          : null,
        source_agent: agentCode,
        source_artifact_id: artifact.id,
      }))

      const { data: createdTasks } = await supabase
        .from("tasks")
        .insert(tasksToInsert)
        .select("id, title, due_at")

      // Send task reminders to Telegram (if linked)
      if (createdTasks && createdTasks.length > 0) {
        const { data: telegramAccount } = await supabase
          .from("telegram_accounts")
          .select("chat_id")
          .eq("user_id", user.id)
          .not("chat_id", "is", null)
          .single()

        if (telegramAccount?.chat_id) {
          // Send first 3 tasks as reminders
          for (const task of createdTasks.slice(0, 3)) {
            await sendTaskReminder(
              telegramAccount.chat_id,
              task.id,
              task.title,
              task.due_at || undefined
            )
          }
        }
      }
    }
  } catch (error) {
    // Don't fail artifact save if task extraction fails
    console.error("Task extraction error:", error)
  }

  // ═══ NOTIFY TELEGRAM: STAGE COMPLETE ═══
  try {
    const { data: telegramAccount } = await supabase
      .from("telegram_accounts")
      .select("chat_id")
      .eq("user_id", user.id)
      .not("chat_id", "is", null)
      .single()

    if (telegramAccount?.chat_id) {
      const currentAgent = AGENTS.find((a) => a.code === agentCode)
      const nextAgent = AGENTS.find((a) => a.step === (currentAgent?.step || 0) + 1)

      await sendStageComplete(
        telegramAccount.chat_id,
        currentAgent?.name || agentCode,
        nextAgent?.name
      )
    }
  } catch {
    // Non-critical, don't fail
  }

  return NextResponse.json({ artifact })
}

/**
 * GET /api/artifacts?projectId=xxx — получить все артефакты проекта
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projectId = request.nextUrl.searchParams.get("projectId")
  if (!projectId) {
    return NextResponse.json(
      { error: "Missing projectId" },
      { status: 400 }
    )
  }

  // Verify user has access to the project
  const hasAccess = await verifyProjectAccess(supabase, user.id, projectId)
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Project not found or access denied" },
      { status: 403 }
    )
  }

  const { data: artifacts } = await supabase
    .from("artifacts")
    .select(
      "id, type, title, content_md, content_json, status, created_at, agent_id"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  return NextResponse.json({ artifacts: artifacts || [] })
}
