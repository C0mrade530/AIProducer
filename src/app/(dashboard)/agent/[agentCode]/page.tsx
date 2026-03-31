import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAgentByCode } from "@/lib/agents/constants"
import { AgentChat } from "@/components/agents/agent-chat"

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentCode: string }>
}) {
  const { agentCode } = await params
  const agentConfig = getAgentByCode(agentCode)
  if (!agentConfig) redirect("/dashboard")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get workspace and project
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  const { data: project } = await supabase
    .from("projects")
    .select("id, current_step")
    .eq("workspace_id", workspace?.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect("/dashboard")

  // Get agent definition from DB
  const { data: agentDef } = await supabase
    .from("agent_definitions")
    .select("id")
    .eq("code", agentCode)
    .single()

  // Get existing run for this project+agent
  const { data: existingRun } = await supabase
    .from("agent_runs")
    .select("id")
    .eq("project_id", project.id)
    .eq("agent_id", agentDef?.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Get chat history if run exists
  let messages: Array<{ role: string; content: string; created_at: string }> = []
  if (existingRun) {
    const { data: chatMessages } = await supabase
      .from("agent_messages")
      .select("role, content, created_at")
      .eq("run_id", existingRun.id)
      .order("created_at", { ascending: true })

    messages = chatMessages || []
  }

  // Get artifacts for this agent+project
  const { data: artifacts } = await supabase
    .from("artifacts")
    .select("*")
    .eq("project_id", project.id)
    .eq("agent_id", agentDef?.id)
    .order("created_at", { ascending: false })

  return (
    <AgentChat
      agentCode={agentCode}
      agentConfig={agentConfig}
      projectId={project.id}
      runId={existingRun?.id}
      initialMessages={messages}
      artifacts={artifacts || []}
    />
  )
}
