import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  // Get project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", workspace?.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        profile={profile}
        workspaceId={workspace?.id}
        projectId={project?.id}
        currentStep={project?.current_step || 1}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
