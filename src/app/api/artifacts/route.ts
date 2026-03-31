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
