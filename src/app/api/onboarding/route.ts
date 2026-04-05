import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email/resend"
import { trackEvent } from "@/lib/analytics/track"

/**
 * POST /api/onboarding — Complete onboarding
 * Creates workspace, project, subscription, updates profile
 * Runs server-side with proper Supabase session
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  try {
    // Check if already onboarded
    const { data: existingWs } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle()

    if (existingWs) {
      // Already has workspace — just update name and mark done
      await supabase.from("profiles").update({
        name: name.trim(),
        onboarding_completed: true,
      }).eq("id", user.id)

      return NextResponse.json({ ok: true, workspaceId: existingWs.id })
    }

    // Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({ owner_id: user.id, title: name.trim(), niche: "" })
      .select("id")
      .single()

    if (wsError) {
      console.error("Workspace create error:", wsError)
      return NextResponse.json({ error: wsError.message, detail: "workspace_insert" }, { status: 500 })
    }

    // Create member, project, subscription in parallel
    const results = await Promise.allSettled([
      supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      }),
      supabase.from("projects").insert({
        workspace_id: workspace.id,
        name: "Мой первый продукт",
      }),
      supabase.from("subscriptions").insert({
        workspace_id: workspace.id,
        plan: "starter",
        status: "active",
      }),
    ])

    // Log any failures but don't block
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Onboarding step ${i} failed:`, r.reason)
      }
    })

    // Mark onboarding complete + save email for transactional emails
    await supabase.from("profiles").update({
      name: name.trim(),
      email: user.email,
      onboarding_completed: true,
    }).eq("id", user.id)

    // Track + send welcome email (non-blocking)
    trackEvent(supabase, "onboarding_complete", { name: name.trim() }, workspace.id)
    sendWelcomeEmail(user.email!, name.trim()).catch((err) =>
      console.error("Welcome email error:", err)
    )

    return NextResponse.json({ ok: true, workspaceId: workspace.id })
  } catch (err) {
    console.error("Onboarding error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
