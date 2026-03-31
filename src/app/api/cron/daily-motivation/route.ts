import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendDailyPlan } from "@/lib/telegram/daily"

/**
 * GET /api/cron/daily-motivation
 *
 * Вызывается ежедневно по cron (утром, ~9:00 MSK).
 * Отправляет каждому привязанному Telegram-пользователю:
 * - Персональную мотивацию (AI-генерация из распаковки)
 * - План на день (задачи с дедлайном на сегодня)
 *
 * Защита: проверка CRON_SECRET в Authorization header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()

  // Get all users with linked Telegram
  const { data: telegramUsers } = await supabase
    .from("telegram_accounts")
    .select("user_id, chat_id")
    .not("chat_id", "is", null)

  if (!telegramUsers || telegramUsers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No linked Telegram users" })
  }

  let sentCount = 0

  for (const tgUser of telegramUsers) {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, niche")
        .eq("id", tgUser.user_id)
        .single()

      if (!profile) continue

      // Get workspace + project
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", tgUser.user_id)
        .single()

      if (!workspace) continue

      const { data: project } = await supabase
        .from("projects")
        .select("id, current_step")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!project) continue

      // Get today's tasks (due today or overdue, or pending without due date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      const { data: todayTasks } = await supabase
        .from("tasks")
        .select("id, title, due_at")
        .eq("project_id", project.id)
        .in("status", ["pending", "in_progress"])
        .or(`due_at.lte.${today.toISOString()},due_at.is.null`)
        .order("priority", { ascending: true })
        .limit(10)

      // Count completed
      const { count: completedTotal } = await supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("project_id", project.id)
        .eq("status", "completed")

      const { count: totalTasks } = await supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("project_id", project.id)

      // Get unpacker artifact for personalized motivation
      const { data: unpackerArtifact } = await supabase
        .from("artifacts")
        .select("content_md")
        .eq("project_id", project.id)
        .eq("type", "unpacker_output")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      await sendDailyPlan({
        chatId: tgUser.chat_id,
        expertName: profile.name,
        niche: profile.niche || "",
        todayTasks: todayTasks || [],
        completedTotal: completedTotal || 0,
        totalTasks: totalTasks || 0,
        currentStep: project.current_step || 1,
        unpackerSummary: unpackerArtifact?.content_md || null,
      })

      sentCount++
    } catch (error) {
      console.error(`Daily motivation failed for user ${tgUser.user_id}:`, error)
    }
  }

  return NextResponse.json({ sent: sentCount, total: telegramUsers.length })
}
