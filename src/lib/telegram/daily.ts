/**
 * Ежедневная мотивация и план дня через Telegram.
 *
 * Вызывается по cron (например, Vercel Cron или external scheduler).
 * Для каждого пользователя с привязанным Telegram:
 * 1. Берёт незавершённые задачи на сегодня
 * 2. Берёт данные из распаковки (цели, ниша)
 * 3. Генерирует персональное мотивационное сообщение через AI
 * 4. Отправляет в Telegram
 */

import { callAgent, type AgentMessage } from "@/lib/agents/engine"
import { sendMessage, sendTaskReminder } from "./bot"

interface DailyContext {
  chatId: number | string
  expertName: string
  niche: string
  todayTasks: Array<{ id: string; title: string; due_at: string | null }>
  completedTotal: number
  totalTasks: number
  currentStep: number
  unpackerSummary: string | null
}

/**
 * Генерирует персональную мотивацию на основе контекста пользователя.
 */
export async function generateDailyMotivation(
  ctx: DailyContext
): Promise<string> {
  const tasksList = ctx.todayTasks
    .map((t, i) => `${i + 1}. ${t.title}`)
    .join("\n")

  const messages: AgentMessage[] = [
    {
      role: "system",
      content: `Ты — AI-коуч в приложении AIProducer. Пиши КОРОТКО (3-5 предложений).
Стиль: тёплый, энергичный, на ты. Формат: HTML (используй <b> для акцентов).
НЕ используй эмодзи больше 3 штук. Обращайся по имени.`,
    },
    {
      role: "user",
      content: `Сгенерируй утреннее сообщение для:
Имя: ${ctx.expertName}
Ниша: ${ctx.niche || "не указана"}
Прогресс: этап ${ctx.currentStep}/7, выполнено ${ctx.completedTotal}/${ctx.totalTasks} задач
${ctx.unpackerSummary ? `\nИз распаковки эксперта:\n${ctx.unpackerSummary.substring(0, 1000)}` : ""}
${tasksList ? `\nЗадачи на сегодня:\n${tasksList}` : "\nНет задач на сегодня — предложи вернуться к агентам"}`,
    },
  ]

  try {
    const result = await callAgent(messages, {
      model: "claude-sonnet-4-6",
      temperature: 0.8,
      maxTokens: 300,
    })
    return result.content
  } catch {
    // Fallback — static motivation
    return `Доброе утро, <b>${ctx.expertName}</b>! Сегодня отличный день, чтобы продвинуться к запуску продукта. ${
      ctx.todayTasks.length > 0
        ? `У тебя ${ctx.todayTasks.length} задач на сегодня — начни с первой!`
        : "Открой AIProducer и продолжи работу с агентами."
    }`
  }
}

/**
 * Отправить ежедневный план пользователю.
 * Вызывается для каждого пользователя с привязанным Telegram.
 */
export async function sendDailyPlan(ctx: DailyContext) {
  // 1. Generate personalized motivation
  const motivation = await generateDailyMotivation(ctx)

  // 2. Send motivation message
  await sendMessage(ctx.chatId, motivation)

  // 3. Send today's tasks as interactive reminders
  for (const task of ctx.todayTasks.slice(0, 5)) {
    await sendTaskReminder(ctx.chatId, task.id, task.title, task.due_at || undefined)
  }
}
