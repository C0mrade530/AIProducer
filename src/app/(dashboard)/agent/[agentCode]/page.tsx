"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getAgentByCode } from "@/lib/agents/constants"
import { AgentChat } from "@/components/agents/agent-chat"

const ACTIVE_PROJECT_KEY = "getprodi:active-project-id"

export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const agentCode = params.agentCode as string
  const agentConfig = getAgentByCode(agentCode)

  const [projectId, setProjectId] = useState<string>("")
  const [runId, setRunId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Array<{ role: string; content: string; created_at?: string }>>([])
  const [artifacts, setArtifacts] = useState<Array<{ id: string; type: string; title: string; content_md: string; status: string }>>([])
  const [loading, setLoading] = useState(true)
  const [agentError, setAgentError] = useState("")

  useEffect(() => {
    if (!agentConfig) { router.push("/dashboard"); return }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // ── Pick project: URL param → localStorage → most recent ──
    const urlProjectId = searchParams.get("projectId")
    const storedProjectId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_PROJECT_KEY) : null
    const preferredProjectId = urlProjectId || storedProjectId

    let project: { id: string; current_step: number } | null = null

    if (preferredProjectId) {
      const { data } = await supabase
        .from("projects")
        .select("id, current_step")
        .eq("id", preferredProjectId)
        .eq("workspace_id", workspace.id)
        .maybeSingle()
      project = data
    }

    // Fallback: most recent project
    if (!project) {
      const { data } = await supabase
        .from("projects")
        .select("id, current_step")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      project = data
    }

    if (!project) { router.push("/dashboard"); return }
    setProjectId(project.id)

    // Persist the active project so chat history survives navigation
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_PROJECT_KEY, project.id)
    }

    // Get agent def
    const { data: agentDef } = await supabase
      .from("agent_definitions")
      .select("id")
      .eq("code", agentCode)
      .single()

    if (!agentDef) {
      setAgentError("Агент не найден в базе данных. Обратитесь к администратору.")
      setLoading(false)
      return
    }

    // Existing run — use maybeSingle so 0 rows doesn't throw
    const { data: existingRun } = await supabase
      .from("agent_runs")
      .select("id")
      .eq("project_id", project.id)
      .eq("agent_id", agentDef.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

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

  // FIX #6: Show error state instead of blank screen
  if (agentError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="font-heading text-xl font-semibold mb-2">Ошибка</h2>
        <p className="text-muted-foreground mb-4">{agentError}</p>
        <button onClick={() => router.push("/dashboard")} className="text-primary hover:underline cursor-pointer">
          Вернуться на Dashboard
        </button>
      </div>
    )
  }

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
