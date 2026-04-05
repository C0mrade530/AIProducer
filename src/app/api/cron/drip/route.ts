import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendNudgeEmail, sendSubscriptionExpiringEmail } from "@/lib/email/resend"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getprodi.ru"

/**
 * POST /api/cron/drip — Drip email campaign + subscription warnings
 *
 * Called daily by external cron. Protected by CRON_SECRET.
 *
 * Sequences:
 * - Day 1 after signup: "Как прошла распаковка?" (if no artifact saved)
 * - Day 3: "Не забудь продолжить" (if stuck on step 1-2)
 * - Day 5 before expiry: subscription warning
 * - Day 1 before expiry: urgent warning
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date()
  let sent = 0

  // ── Day 1 nudge: registered yesterday, no artifacts ──
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const dayBeforeYesterday = new Date(now)
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2)

  const { data: newUsers } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("onboarding_completed", true)
    .not("email", "is", null)
    .gte("created_at", dayBeforeYesterday.toISOString())
    .lte("created_at", yesterday.toISOString())

  for (const user of newUsers || []) {
    // Check if they have any artifacts
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!ws) continue

    const { data: project } = await supabase
      .from("projects")
      .select("id, current_step")
      .eq("workspace_id", ws.id)
      .limit(1)
      .single()

    if (!project || project.current_step <= 1) {
      try {
        await sendNudgeEmail(
          user.email!,
          user.name || "Эксперт",
          "Как прошла распаковка?",
          "Ты зарегистрировался в GetProdi — отличный первый шаг! Распаковщик поможет найти твоё уникальное позиционирование и понять, как монетизировать свою экспертизу. Обычно это занимает 10-15 минут.",
          "Начать распаковку",
          `${APP_URL}/agent/unpacker`
        )
        sent++
      } catch (err) {
        console.error("Day 1 nudge error:", err)
      }
    }
  }

  // ── Day 3 nudge: registered 3 days ago, stuck on step 1-2 ──
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const fourDaysAgo = new Date(now)
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

  const { data: stuckUsers } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("onboarding_completed", true)
    .not("email", "is", null)
    .gte("created_at", fourDaysAgo.toISOString())
    .lte("created_at", threeDaysAgo.toISOString())

  for (const user of stuckUsers || []) {
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!ws) continue

    const { data: project } = await supabase
      .from("projects")
      .select("id, current_step")
      .eq("workspace_id", ws.id)
      .limit(1)
      .single()

    if (project && project.current_step <= 2) {
      try {
        await sendNudgeEmail(
          user.email!,
          user.name || "Эксперт",
          "Твой AI-продюсер ждёт тебя",
          "У тебя ещё есть незавершённые шаги в GetProdi. Эксперты, которые проходят все 7 агентов, получают полностью готовую стратегию монетизации. Продолжи — это займёт не больше часа.",
          "Продолжить работу",
          `${APP_URL}/dashboard`
        )
        sent++
      } catch (err) {
        console.error("Day 3 nudge error:", err)
      }
    }
  }

  // ── Subscription warnings: 5 days and 1 day before expiry ──
  for (const daysLeft of [5, 1]) {
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + daysLeft)
    const rangeStart = new Date(targetDate)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(targetDate)
    rangeEnd.setHours(23, 59, 59, 999)

    const { data: expiringSubs } = await supabase
      .from("subscriptions")
      .select("id, workspace_id, plan, current_period_end, payment_method_id")
      .eq("status", "active")
      .gte("current_period_end", rangeStart.toISOString())
      .lte("current_period_end", rangeEnd.toISOString())

    for (const sub of expiringSubs || []) {
      // Skip if auto-renewal is set up
      if (sub.payment_method_id) continue

      const { data: ws } = await supabase
        .from("workspaces")
        .select("owner_id")
        .eq("id", sub.workspace_id)
        .single()

      if (!ws) continue

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", ws.owner_id)
        .single()

      if (profile?.email) {
        try {
          await sendSubscriptionExpiringEmail(
            profile.email,
            profile.name || "Эксперт",
            sub.plan,
            daysLeft
          )
          sent++
        } catch (err) {
          console.error(`Expiry warning (${daysLeft}d) error:`, err)
        }
      }
    }
  }

  return NextResponse.json({ sent })
}
