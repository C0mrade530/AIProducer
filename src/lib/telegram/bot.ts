/**
 * Telegram Bot API helpers
 *
 * Бот используется для:
 * 1. Привязки аккаунта (deep link)
 * 2. Отправки напоминаний от трекера
 * 3. Inline-кнопки для задач (Выполнено / Перенести / Пропустить)
 * 4. Мотивационные сообщения
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`

interface TelegramResponse {
  ok: boolean
  result?: unknown
  description?: string
}

/**
 * Отправить сообщение в чат
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2"
    replyMarkup?: object
  }
): Promise<TelegramResponse> {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode || "HTML",
      reply_markup: options?.replyMarkup,
    }),
  })

  return res.json()
}

/**
 * Отправить напоминание о задаче с inline-кнопками
 */
export async function sendTaskReminder(
  chatId: number | string,
  taskId: string,
  taskTitle: string,
  dueDate?: string
) {
  const dueLine = dueDate
    ? `\n📅 Дедлайн: ${new Date(dueDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`
    : ""

  return sendMessage(chatId, `📋 <b>Напоминание о задаче</b>\n\n${taskTitle}${dueLine}`, {
    replyMarkup: {
      inline_keyboard: [
        [
          { text: "✅ Выполнено", callback_data: `task_done:${taskId}` },
          { text: "⏭ Перенести", callback_data: `task_postpone:${taskId}` },
        ],
        [{ text: "⏩ Пропустить", callback_data: `task_skip:${taskId}` }],
      ],
    },
  })
}

/**
 * Отправить мотивационное сообщение
 */
export async function sendMotivation(
  chatId: number | string,
  expertName: string,
  completedTasks: number,
  totalTasks: number
) {
  const progress = Math.round((completedTasks / totalTasks) * 100)
  const progressBar =
    "█".repeat(Math.round(progress / 10)) +
    "░".repeat(10 - Math.round(progress / 10))

  const messages = [
    `${expertName}, ты уже ${progress}% пути! Продолжай, результат близко.`,
    `Сегодня отличный день для прорыва, ${expertName}! ${completedTasks} из ${totalTasks} задач выполнено.`,
    `${expertName}, каждый маленький шаг приближает к большой цели. Не останавливайся!`,
    `Ты делаешь больше, чем 90% экспертов, ${expertName}. Продолжай в том же духе!`,
  ]

  const randomMessage = messages[Math.floor(Math.random() * messages.length)]

  return sendMessage(
    chatId,
    `🔥 <b>Твой прогресс</b>\n\n${progressBar} ${progress}%\n\n${randomMessage}`
  )
}

/**
 * Отправить сообщение о завершении этапа
 */
export async function sendStageComplete(
  chatId: number | string,
  stageName: string,
  nextStageName?: string
) {
  let text = `🎉 <b>Этап завершён!</b>\n\nТы прошёл этап: <b>${stageName}</b>`

  if (nextStageName) {
    text += `\n\nСледующий этап: <b>${nextStageName}</b>\nОткрой GetProdi и продолжай!`
  } else {
    text += `\n\n🏆 Все этапы пройдены! Поздравляю!`
  }

  return sendMessage(chatId, text)
}

/**
 * Установить webhook для бота
 */
export async function setWebhook(url: string): Promise<TelegramResponse> {
  const res = await fetch(`${API_BASE}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      allowed_updates: ["message", "callback_query"],
    }),
  })

  return res.json()
}

/**
 * Получить информацию о боте
 */
export async function getMe(): Promise<TelegramResponse> {
  const res = await fetch(`${API_BASE}/getMe`)
  return res.json()
}
