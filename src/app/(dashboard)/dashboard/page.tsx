"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AGENTS } from "@/lib/agents/constants"
import { StepCard } from "@/components/dashboard/step-card"

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ name: string; niche: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    // Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, niche, onboarding_completed")
      .eq("id", user.id)
      .single()

    if (!profileData?.onboarding_completed) { router.push("/onboarding"); return }
    setProfile(profileData)

    // Workspace + project
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!workspace) { router.push("/onboarding"); return }

    const { data: project } = await supabase
      .from("projects")
      .select("id, current_step")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (project) {
      setCurrentStep(project.current_step || 1)

      // Get artifacts
      const { data: artifacts } = await supabase
        .from("artifacts")
        .select("agent_id")
        .eq("project_id", project.id)

      const { data: agentDefs } = await supabase
        .from("agent_definitions")
        .select("id, code")

      const idToCode = new Map(agentDefs?.map((d) => [d.id, d.code]) || [])
      const completed = new Set(
        artifacts?.map((a) => idToCode.get(a.agent_id)).filter(Boolean) as string[] || []
      )
      setCompletedAgents(completed)
    }

    setLoading(false)
  }

  const completedCount = completedAgents.size
  const progress = Math.round((completedCount / 7) * 100)

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse mb-10" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          Привет, {profile?.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Твой прогресс: {completedCount} из 7 шагов
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {AGENTS.map((agent) => {
          const isCompleted = completedAgents.has(agent.code)
          const isCurrent = agent.step === currentStep
          const isLocked = agent.step > currentStep + 1

          return (
            <StepCard
              key={agent.code}
              agent={agent}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
            />
          )
        })}
      </div>
    </div>
  )
}
