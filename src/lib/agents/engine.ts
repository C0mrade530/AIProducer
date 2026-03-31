/**
 * Agent Engine — оркестратор AI-агентов
 *
 * АРХИТЕКТУРА ЭКОНОМИИ ТОКЕНОВ:
 *
 * === PROMPT CACHING (NEW) ===
 *   Статический промпт агента (до 90KB) отправляется как ПЕРВЫЙ system message.
 *   Anthropic API автоматически кэширует длинные префиксы.
 *   Все пользователи, обращающиеся к одному агенту, переиспользуют кэш.
 *   Экономия: ~90% стоимости на кэшированных токенах.
 *
 * === ДВУХФАЗНАЯ СИСТЕМА ===
 *   Фаза 1 (первое сообщение в run):
 *     Полный system prompt из файла + pipeline context
 *
 *   Фаза 2 (последующие сообщения):
 *     Краткое напоминание роли (~200 токенов)
 *     Экономия: ~80% входных токенов
 *
 * Pipeline передача:
 *   Артефакты предыдущих агентов передаются как structured JSON
 *   Каждый агент получает ВСЕ предыдущие артефакты
 *   Порядок: unpacker → methodologist → promotion → warmup → leadmagnet → sales → tracker
 */

export interface AgentMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AgentRunResult {
  content: string
  tokensInput: number
  tokensOutput: number
  model: string
}

// Маппинг моделей для CometAPI
const MODEL_MAP = {
  "claude-sonnet-4-6": "claude-sonnet-4-20250514",
  "claude-opus-4-6": "claude-opus-4-20250514",
} as const

type ModelKey = keyof typeof MODEL_MAP

/**
 * Определяем модель в зависимости от задачи
 * - Sonnet для диалога (80% запросов, дешёвый)
 * - Opus для финальной генерации артефактов (20%, мощный)
 */
export function selectModel(isArtifactGeneration: boolean): ModelKey {
  return isArtifactGeneration ? "claude-opus-4-6" : "claude-sonnet-4-6"
}

/**
 * Streaming вызов для чат-интерфейса
 *
 * Поддерживает prompt caching через разделение system messages:
 * - Первый system message (длинный статический промпт) → кэшируется Anthropic
 * - Второй system message (динамический контекст) → не кэшируется
 */
export async function streamAgent(
  messages: AgentMessage[],
  options: {
    model?: ModelKey
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<ReadableStream> {
  const {
    model = "claude-sonnet-4-6",
    temperature = 0.7,
    maxTokens = 4096,
  } = options

  const apiKey = process.env.COMET_API_KEY
  if (!apiKey) throw new Error("COMET_API_KEY is not set")

  const response = await fetch("https://api.cometapi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_MAP[model],
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`CometAPI error: ${response.status}`)
  }

  return response.body!
}

/**
 * Вызов AI без стриминга
 */
export async function callAgent(
  messages: AgentMessage[],
  options: {
    model?: ModelKey
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<AgentRunResult> {
  const {
    model = "claude-sonnet-4-6",
    temperature = 0.7,
    maxTokens = 4096,
  } = options

  const apiKey = process.env.COMET_API_KEY
  if (!apiKey) throw new Error("COMET_API_KEY is not set")

  const response = await fetch("https://api.cometapi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_MAP[model],
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`CometAPI error: ${response.status} ${error}`)
  }

  const data = await response.json()
  const choice = data.choices?.[0]

  return {
    content: choice?.message?.content || "",
    tokensInput: data.usage?.prompt_tokens || 0,
    tokensOutput: data.usage?.completion_tokens || 0,
    model: MODEL_MAP[model],
  }
}

/**
 * КРАТКИЕ НАПОМИНАНИЯ ДЛЯ ФАЗЫ 2
 * Используются вместо полного промпта в последующих сообщениях
 * ~200 токенов вместо ~5000-20000
 */
const ROLE_REMINDERS: Record<string, string> = {
  unpacker:
    "Ты — Агент-Распаковщик. Продолжай глубинную распаковку эксперта. Задавай уточняющие вопросы по 1-2 за раз. Докапывайся до истины. Когда все 7 блоков пройдены — сформируй полный ДОКУМЕНТ РАСПАКОВКИ. Общайся на ты, тепло, но прямо.",
  methodologist:
    "Ты — Агент-Методолог. Продолжай работу над продуктом. Используй данные из артефактов распаковки. Задавай вопросы по 3-5 за раз. Резюмируй после каждого блока. В финале сформируй ПРОДУКТОВЫЙ ПАСПОРТ.",
  promotion:
    "Ты — Агент-Маркетолог. Продолжай работу над контент-стратегией. Опирайся на данные распаковки и продуктового паспорта. Предлагай конкретные темы, hooks, CTA. В финале сформируй КОНТЕНТ-ПЛАН.",
  warmup:
    "Ты — Агент-Прогревщик. Продолжай работу над стратегией прогрева. Используй данные всех предыдущих этапов. Создавай сюжетные линии, Stories, прогревающий контент. В финале сформируй СТРАТЕГИЮ ПРОГРЕВА.",
  leadmagnet:
    "Ты — Агент-Воронки. Продолжай работу над лид-магнитами и воронками. Опирайся на все предыдущие артефакты. Проектируй путь клиента от первого касания до покупки. В финале сформируй КАРТУ ВОРОНОК.",
  sales:
    "Ты — Агент-Продажник. Продолжай работу над скриптами и стратегией продаж. Используй все данные pipeline. Пиши конкретные скрипты, шаблоны, обработку возражений. В финале сформируй ПРОДАЖНЫЙ ПАКЕТ.",
  tracker:
    "Ты — Агент-Трекер. Анализируй прогресс и результаты всех этапов. Создавай конкретные задачи с дедлайнами. Приоритизируй по принципу ONE Thing. В финале сформируй ПЛАН ДЕЙСТВИЙ НА НЕДЕЛЮ.",
}

/**
 * Построить контекст для агента — ДВУХФАЗНАЯ СИСТЕМА С PROMPT CACHING
 *
 * Prompt caching работает так:
 * - Статический промпт (одинаковый для всех пользователей) идёт ПЕРВЫМ system message
 * - Anthropic кэширует длинные префиксы автоматически
 * - Динамический контекст (артефакты, профиль) идёт ВТОРЫМ system message
 * - Это позволяет кэшировать 15-90KB промпта между пользователями
 *
 * @param isFirstMessage - true = Фаза 1 (полный промпт), false = Фаза 2 (краткое напоминание)
 */
export function buildAgentContext(
  agentCode: string,
  fullSystemPrompt: string,
  pipelineInstructions: string,
  knowledgeTexts: string[],
  previousArtifacts: Array<{ type: string; title: string; content_md: string }>,
  userProfile: { name: string; niche: string; bio: string } | undefined,
  isFirstMessage: boolean
): AgentMessage[] {
  const messages: AgentMessage[] = []

  if (isFirstMessage) {
    // ═══ ФАЗА 1: Полный промпт с prompt caching ═══

    // SYSTEM MESSAGE 1: Статический промпт (КЭШИРУЕТСЯ)
    // Этот промпт одинаковый для всех пользователей одного агента
    // Anthropic автоматически кэширует длинные префиксы
    let staticPrompt = fullSystemPrompt
    if (pipelineInstructions) {
      staticPrompt += "\n\n" + pipelineInstructions
    }
    // Knowledge files are per-agent, not per-user, so they're cacheable too
    if (knowledgeTexts.length > 0) {
      staticPrompt +=
        "\n\n## Базовые знания агента\n\n" +
        knowledgeTexts.join("\n\n---\n\n")
    }
    staticPrompt += "\n\nОтвечай на русском языке. Будь конкретен, структурирован и полезен. Общайся на ты."

    messages.push({ role: "system", content: staticPrompt })

    // SYSTEM MESSAGE 2: Динамический контекст (НЕ кэшируется)
    // Уникальный для каждого пользователя
    let dynamicContext = ""

    if (userProfile) {
      dynamicContext += `## Профиль эксперта\nИмя: ${userProfile.name}\nНиша: ${userProfile.niche}\nО себе: ${userProfile.bio}`
    }

    if (previousArtifacts.length > 0) {
      dynamicContext += "\n\n## Результаты предыдущих этапов (артефакты)\n\n"
      dynamicContext += previousArtifacts
        .map((a) => `### ${a.title} [${a.type}]\n${a.content_md}`)
        .join("\n\n---\n\n")
    }

    if (dynamicContext) {
      messages.push({ role: "system", content: dynamicContext })
    }
  } else {
    // ═══ ФАЗА 2: Краткое напоминание ═══
    // ~200 токенов вместо ~5000-20000
    const reminder =
      ROLE_REMINDERS[agentCode] || "Продолжай работу в своей роли."

    let systemContent = reminder

    if (userProfile) {
      systemContent += `\nЭксперт: ${userProfile.name}, ниша: ${userProfile.niche}`
    }

    systemContent += "\nОтвечай на русском языке."

    messages.push({ role: "system", content: systemContent })
  }

  return messages
}

/**
 * Pipeline order — порядок агентов в цепочке
 */
export const PIPELINE_ORDER = [
  "unpacker",
  "methodologist",
  "promotion",
  "warmup",
  "leadmagnet",
  "sales",
  "tracker",
] as const

/**
 * Получить коды предыдущих агентов в pipeline
 */
export function getPreviousAgentCodes(agentCode: string): string[] {
  const index = PIPELINE_ORDER.indexOf(
    agentCode as (typeof PIPELINE_ORDER)[number]
  )
  if (index <= 0) return []
  return [...PIPELINE_ORDER.slice(0, index)]
}
