import { SupabaseClient } from "@supabase/supabase-js"
import { PLANS, type PlanKey } from "@/lib/payments/yookassa"

interface LimitCheckResult {
  allowed: boolean
  reason?: string
  plan: string
  usage: number
  limit: number
}

/**
 * Проверяет, не превышен ли лимит вызовов агентов для workspace.
 *
 * Считает agent_runs за текущий месяц и сравнивает с лимитом плана.
 */
export async function checkAgentRunLimit(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<LimitCheckResult> {
  // Get subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .single()

  const plan = (subscription?.plan || "starter") as PlanKey
  const planConfig = PLANS[plan] || PLANS.starter
  const limit = planConfig.limits.agentRunsPerMonth

  // Count agent runs this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Get workspace project IDs first
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", workspaceId)

  const projectIds = projects?.map((p) => p.id) || []
  if (projectIds.length === 0) {
    return { allowed: true, plan: planConfig.name, usage: 0, limit }
  }

  const { count } = await supabase
    .from("agent_runs")
    .select("id", { count: "exact", head: true })
    .in("project_id", projectIds)
    .gte("created_at", startOfMonth.toISOString())

  const usage = count || 0

  if (usage >= limit) {
    return {
      allowed: false,
      reason: `Достигнут лимит вызовов агентов (${limit}/мес) для плана ${planConfig.name}. Перейди на более высокий план.`,
      plan: planConfig.name,
      usage,
      limit,
    }
  }

  return { allowed: true, plan: planConfig.name, usage, limit }
}
