import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendMessage } from "@/lib/telegram/bot"

/**
 * POST /api/telegram — Telegram Bot webhook handler
 *
 * Handles:
 * 1. /start <token> — account linking
 * 2. callback_query — task inline buttons (done/postpone/skip)
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = await createClient()

  // Handle /start command (account linking)
  if (body.message?.text?.startsWith("/start")) {
    const parts = body.message.text.split(" ")
    const linkToken = parts[1]
    const telegramUser = body.message.from
    const chatId = body.message.chat.id

    if (linkToken) {
      // Find the linking token in telegram_accounts
      const { data: account } = await supabase
        .from("telegram_accounts")
        .select("id, user_id")
        .eq("linking_token", linkToken)
        .is("telegram_user_id", null)
        .single()

      if (account) {
        // Link the account
        await supabase
          .from("telegram_accounts")
          .update({
            telegram_user_id: telegramUser.id,
            username: telegramUser.username || null,
            first_name: telegramUser.first_name || null,
            chat_id: chatId,
            linked_at: new Date().toISOString(),
            linking_token: null,
          })
          .eq("id", account.id)

        await sendMessage(
          chatId,
          `✅ <b>Аккаунт привязан!</b>\n\nТеперь я буду присылать тебе:\n- Напоминания о задачах\n- Мотивацию и поддержку\n- Уведомления о прогрессе\n\nУдачи в создании продукта! 🚀`
        )
      } else {
        await sendMessage(
          chatId,
          `❌ Ссылка для привязки недействительна или уже использована.\n\nПерейди в настройки GetProdi и создай новую ссылку.`
        )
      }
    } else {
      // Just /start without token
      await sendMessage(
        chatId,
        `👋 <b>Привет! Я — GetProdi Bot.</b>\n\nЯ помогу тебе оставаться в тонусе и выполнять задачи по созданию онлайн-продукта.\n\nЧтобы начать, привяжи свой аккаунт в настройках на сайте GetProdi.`
      )
    }

    return NextResponse.json({ ok: true })
  }

  // Handle callback queries (inline button clicks)
  if (body.callback_query) {
    const callbackData = body.callback_query.data
    const chatId = body.callback_query.message.chat.id

    if (callbackData.startsWith("task_")) {
      const [action, taskId] = callbackData.split(":")

      // Find user by chat_id
      const { data: telegramAccount } = await supabase
        .from("telegram_accounts")
        .select("user_id")
        .eq("chat_id", chatId)
        .single()

      if (!telegramAccount) {
        return NextResponse.json({ ok: true })
      }

      let newStatus: string
      let responseText: string

      switch (action) {
        case "task_done":
          newStatus = "completed"
          responseText = "✅ Задача отмечена как выполненная! Отличная работа!"
          break
        case "task_postpone":
          newStatus = "pending"
          responseText = "⏭ Задача перенесена. Не забудь вернуться к ней!"
          break
        case "task_skip":
          newStatus = "skipped"
          responseText = "⏩ Задача пропущена."
          break
        default:
          return NextResponse.json({ ok: true })
      }

      // Update task
      await supabase
        .from("tasks")
        .update({
          status: newStatus,
          completed_at:
            newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", taskId)

      // Log tracker event
      await supabase.from("tracker_events").insert({
        task_id: taskId,
        event_type: newStatus,
        channel: "telegram",
        payload: { callback_data: callbackData },
      })

      // Send response
      await sendMessage(chatId, responseText)
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}

/**
 * GET /api/telegram — set webhook (call once during setup)
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("set_webhook")

  if (url) {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `${url}/api/telegram`,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    )

    const data = await res.json()
    return NextResponse.json(data)
  }

  // Get bot info
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
  )
  const data = await res.json()
  return NextResponse.json(data)
}
