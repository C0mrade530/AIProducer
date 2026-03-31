"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getAgentByCode } from "@/lib/agents/constants"
import { AgentChat } from "@/components/agents/agent-chat"

export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentCode = params.agentCode as string
  const agentConfig = getAgentByCode(agentCode)

  const [projectId, setProjectId] = useState<string>("")
  const [runId, setRunId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Array<{ role: string; content: string; created_at?: string }>>([])
  const [artifacts, setArtifacts] = useState<Array<{ id: string; type: string; title: string; content_md: string; status: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!agentConfig) { router.push("/dashboard"); return }
    loadData()
  }, [agentCode])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!workspace) { router.push("/dashboard"); return }

    const { data: project } = await supabase
      .from("projects")
      .select("id, current_step")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!project) { router.push("/dashboard"); return }
    setProjectId(project.id)

    // Get agent def
    const { data: agentDef } = await supabase
      .from("agent_definitions")
      .select("id")
      .eq("code", agentCode)
      .single()

    if (!agentDef) { setLoading(false); return }

    // Existing run
    const { data: existingRun } = await supabase
      .from("agent_runs")
      .select("id")
      .eq("project_id", project.id)
      .eq("agent_id", agentDef.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (existingRun) {
      setRunId(existingRun.id)
      const { data: chatMessages } = await supabase
        .from("agent_messages")
        .select("role, content, created_at")
        .eq("run_id", existingRun.id)
        .order("created_at", { ascending: true })
      setMessages(chatMessages || [])
    }

    // Artifacts
    const { data: arts } = await supabase
      .from("artifacts")
      .select("id, type, title, content_md, status")
      .eq("project_id", project.id)
      .eq("agent_id", agentDef.id)
      .order("created_at", { ascending: false })

    setArtifacts(arts || [])
    setLoading(false)
  }

  if (!agentConfig) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AgentChat
      agentCode={agentCode}
      agentConfig={agentConfig}
      projectId={projectId}
      runId={runId}
      initialMessages={messages}
      artifacts={artifacts}
    />
  )
}
