import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AGENTS } from "@/lib/agents/constants"
import { StepCard } from "@/components/dashboard/step-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_completed) redirect("/onboarding")

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

  // Get artifacts for this project
  const { data: artifacts } = await supabase
    .from("artifacts")
    .select("agent_id, type, status, created_at, id")
    .eq("project_id", project?.id)

  // Get agent definitions to map IDs to codes
  const { data: agentDefs } = await supabase
    .from("agent_definitions")
    .select("id, code")

  const agentIdToCode = new Map(agentDefs?.map((d) => [d.id, d.code]) || [])

  // Map which agent codes have artifacts
  const completedAgents = new Set(
    artifacts?.map((a) => agentIdToCode.get(a.agent_id)).filter(Boolean) || []
  )

  const currentStep = project?.current_step || 1
  const completedCount = completedAgents.size
  const progress = Math.round((completedCount / 7) * 100)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          Привет, {profile?.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Твой прогресс: {completedCount} из 7 шагов
        </p>
      </div>

      {/* Progress bar */}
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

      {/* Steps grid */}
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
