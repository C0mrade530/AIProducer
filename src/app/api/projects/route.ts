import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/projects — list all projects for current user's workspace
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) return NextResponse.json({ projects: [] })

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, current_step, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })

  // Get subscription for limit info
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .single()

  const limits: Record<string, number> = { starter: 1, pro: 3, premium: 5 }
  const maxProjects = limits[subscription?.plan || "starter"] || 1

  return NextResponse.json({
    projects: projects || [],
    maxProjects,
    plan: subscription?.plan || null,
  })
}

/**
 * POST /api/projects — create a new project
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 })

  // Check project limit
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .single()

  const limits: Record<string, number> = { starter: 1, pro: 3, premium: 5 }
  const maxProjects = limits[subscription?.plan || "starter"] || 1

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)

  if (count !== null && count >= maxProjects) {
    return NextResponse.json(
      { error: `Лимит проектов (${maxProjects}). Перейдите на более высокий тариф.`, upsell: true },
      { status: 429 }
    )
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ workspace_id: workspace.id, name: name.trim() })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project })
}

/**
 * PATCH /api/projects — rename a project
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, name } = await request.json()
  if (!projectId || !name?.trim()) {
    return NextResponse.json({ error: "Missing projectId or name" }, { status: 400 })
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update({ name: name.trim() })
    .eq("id", projectId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project })
}
