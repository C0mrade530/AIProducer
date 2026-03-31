import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

  const body = await request.json()
  const { projectId, agentCode, runId, title, type, contentMd, contentJson } =
    body

  if (!projectId || !agentCode || !title || !contentMd) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
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

  // FIX #7: Auto-generate tasks from artifact content
  const tasks = extractTasksFromContent(contentMd, agentCode)
  if (tasks.length > 0) {
    await supabase.from("tasks").insert(
      tasks.map((t) => ({
        project_id: projectId,
        source_artifact_id: artifact.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: "pending",
      }))
    )
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

  const { data: artifacts } = await supabase
    .from("artifacts")
    .select(
      "id, type, title, content_md, content_json, status, created_at, agent_id"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  return NextResponse.json({ artifacts: artifacts || [] })
}

/**
 * FIX #7: Extract actionable tasks from artifact markdown content
 * Looks for bullet points, numbered lists, and action items
 */
function extractTasksFromContent(
  content: string,
  agentCode: string
): Array<{ title: string; description: string; priority: number }> {
  const tasks: Array<{ title: string; description: string; priority: number }> = []

  const agentLabels: Record<string, string> = {
    unpacker: "Распаковка",
    methodologist: "Продукт",
    promotion: "Контент",
    warmup: "Прогрев",
    leadmagnet: "Воронки",
    sales: "Продажи",
    tracker: "Трекинг",
  }

  const label = agentLabels[agentCode] || agentCode

  // Extract lines that look like action items
  const lines = content.split("\n")
  let priority = 2

  for (const line of lines) {
    const trimmed = line.trim()

    // Match: - [ ] task, * task, 1. task, - task (but not headers or short lines)
    const match = trimmed.match(
      /^(?:[-*]\s*(?:\[.\])?\s*|(?:\d+)[.)]\s*)(.{10,120})$/
    )

    if (match) {
      const taskText = match[1].trim()
      // Skip if it looks like a sub-description or just formatting
      if (
        taskText.length < 10 ||
        taskText.startsWith("http") ||
        taskText.startsWith("```")
      )
        continue

      tasks.push({
        title: `[${label}] ${taskText}`,
        description: "",
        priority,
      })

      // Only extract up to 10 tasks per artifact
      if (tasks.length >= 10) break
    }
  }

  // If no structured tasks found, create one generic task per agent
  if (tasks.length === 0) {
    const genericTasks: Record<string, string> = {
      unpacker: "Проверить и утвердить результаты распаковки",
      methodologist: "Проверить структуру продукта и оффер",
      promotion: "Начать публикацию контента по плану",
      warmup: "Запустить прогрев по стратегии",
      leadmagnet: "Создать лид-магнит и настроить воронку",
      sales: "Отработать скрипт продаж на 3 клиентах",
      tracker: "Выполнить задачи за эту неделю",
    }

    if (genericTasks[agentCode]) {
      tasks.push({
        title: `[${label}] ${genericTasks[agentCode]}`,
        description: "Создано автоматически после завершения этапа",
        priority: 2,
      })
    }
  }

  return tasks
}
