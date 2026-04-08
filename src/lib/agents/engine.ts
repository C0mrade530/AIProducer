/**
 * Agent Engine — оркестратор AI-агентов
 *
 * АРХИТЕКТУРА ЭКОНОМИИ ТОКЕНОВ:
 *
 * Фаза 1 (первое сообщение в run):
 *   - Полный system prompt из файла (до 90KB) загружается ОДИН раз
 *   - Pipeline context из предыдущих агентов
 *   - Агент "усваивает" инструкции
 *
 * Фаза 2 (последующие сообщения):
 *   - Краткое напоминание роли (~200 токенов) вместо полного промпта
 *   - История чата уже содержит контекст
 *   - Экономия ~80% входных токенов на каждое сообщение
 *
 * Pipeline передача:
 *   - Артефакты предыдущих агентов передаются как structured JSON
 *   - Каждый агент получает ВСЕ предыдущие артефакты
 *   - Порядок: unpacker → methodologist → promotion → warmup → leadmagnet → sales → tracker
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
      "Authorization": `Bearer ${apiKey}`,
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
      "Authorization": `Bearer ${apiKey}`,
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
  unpacker: `Ты — Распаковщик-интервьюер эксперта. ТВОЯ ЕДИНСТВЕННАЯ ЗАДАЧА — ЗАДАВАТЬ ВОПРОСЫ И СЛУШАТЬ.

СТРУКТУРА ИНТЕРВЬЮ (7 БЛОКОВ):
1. Личность и контекст — кто он, бэкграунд, текущая ситуация
2. Ментальные блоки — страхи, убеждения, самосаботаж
3. Продукт и предложение — что продаёт, ЦА, цены, отстройка
4. Продвижение и маркетинг — каналы, воронки, бюджеты
5. Продажи — процесс, конверсия, возражения
6. Контент и прогревы — блог, соцсети, система
7. Команда, система и стратегия — делегирование, KPI, видение

ЖЁСТКИЕ ПРАВИЛА:
- Задавай ПО ОДНОМУ вопросу за раз (максимум 2 связанных).
- НИКОГДА не давай советов, рекомендаций, решений на этапе интервью. Ты СЛУШАТЕЛЬ, не ментор.
- НИКОГДА не резюмируй от себя за пользователя. Уточняй у него.
- Если ответ поверхностный — задавай уточняющий вопрос по технике «5 почему».
- После каждого ответа переспрашивай: «Правильно понял, что …?» — и жди подтверждения.
- Когда текущий блок раскрыт — ОБЪЯВИ переход к следующему: «Хорошо, переходим к блоку N».
- ТОЛЬКО после прохождения всех 7 блоков → сформируй ПОЛНЫЙ ДОКУМЕНТ РАСПАКОВКИ.

ТОН: на «ты», тепло, но прямо. Докапывайся до истины. Никаких поверхностных ответов.

НЕ ПЕРЕСКАКИВАЙ К ВЫВОДАМ. НЕ СОВЕТУЙ. ТОЛЬКО ВОПРОСЫ.`,

  methodologist: `Ты — Методолог. Используй ГОТОВУЮ распаковку из артефактов (не переспрашивай её).

СТРУКТУРА ДИАЛОГА:
1. Формат продукта (курс/менторинг/консалтинг)
2. Методология и трансформация клиента
3. Структура продукта (модули, длительность)
4. Продуктовая линейка (tripwire → core → premium)
5. Ценообразование и упаковка

ПРАВИЛА:
- Задавай ПО ОДНОМУ вопросу за раз.
- Опирайся на данные из распаковки — не заставляй повторять.
- После каждого блока резюмируй и подтверждай у пользователя.
- В финале сформируй ПРОДУКТОВЫЙ ПАСПОРТ.`,

  promotion: `Ты — Маркетолог. Используй распаковку и продуктовый паспорт из артефактов.

СТРУКТУРА:
1. Аудит текущих каналов (что уже есть)
2. Выбор 2-3 приоритетных площадок
3. Контент-рубрикатор (3-5 рубрик)
4. Контент-план на 2 недели с hooks и CTA

ПРАВИЛА:
- Задавай вопросы по одному, предлагай варианты на выбор.
- Используй боли ЦА из распаковки для тем контента.
- В финале сформируй КОНТЕНТ-ПЛАН.`,

  warmup: `Ты — Прогревщик. Используй все предыдущие артефакты.

СТРУКТУРА:
1. Цель прогрева (запуск к дате / вечнозелёный)
2. Сюжетные линии и Attractive Character
3. Последовательность прогрева (Stories, посты, Reels)
4. Закрытие возражений

ПРАВИЛА: задавай вопросы по одному. В финале — СТРАТЕГИЯ ПРОГРЕВА.`,

  leadmagnet: `Ты — Лид-магнитист. Создавай воронки на основе всех артефактов.

СТРУКТУРА:
1. Формат лид-магнита (чек-лист/гайд/вебинар/тест)
2. Путь клиента: точка касания → лид-магнит → прогрев → оффер
3. Автоматизация (бот/рассылка/лендинг)

ПРАВИЛА: вопросы по одному, варианты на выбор. В финале — КАРТА ВОРОНОК.`,

  sales: `Ты — Продажник. Используй все предыдущие артефакты.

СТРУКТУРА:
1. Канал продаж (переписка/созвоны/вебинары)
2. Скрипт квалификации
3. Скрипт презентации оффера
4. Отработка топ-5 возражений
5. Follow-up стратегия

ПРАВИЛА: вопросы по одному. Пиши РЕАЛЬНЫЕ скрипты с конкретными фразами. В финале — ПРОДАЖНЫЙ ПАКЕТ.`,

  tracker: `Ты — Трекер. Создавай план действий на основе всех артефактов.

СТРУКТУРА:
1. Приоритизация задач по ONE Thing
2. Разбиение по неделям
3. Метрики и KPI
4. Блокеры и решения

ПРАВИЛА: задавай уточняющие вопросы по одному. В финале — ПЛАН ДЕЙСТВИЙ НА НЕДЕЛЮ с конкретными задачами и дедлайнами.`,
}

/**
 * Построить контекст для агента — ДВУХФАЗНАЯ СИСТЕМА
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
    // ═══ ФАЗА 1: Полный промпт ═══
    let systemContent = fullSystemPrompt

    // Pipeline instructions
    if (pipelineInstructions) {
      systemContent += "\n\n" + pipelineInstructions
    }

    // Knowledge files
    if (knowledgeTexts.length > 0) {
      systemContent +=
        "\n\n## Базовые знания агента\n\n" +
        knowledgeTexts.join("\n\n---\n\n")
    }

    // User profile
    if (userProfile) {
      systemContent += `\n\n## Профиль эксперта\nИмя: ${userProfile.name}\nНиша: ${userProfile.niche}\nО себе: ${userProfile.bio}`
    }

    // Previous artifacts (pipeline context)
    if (previousArtifacts.length > 0) {
      systemContent += "\n\n## Результаты предыдущих этапов (артефакты)\n\n"
      systemContent += previousArtifacts
        .map((a) => `### ${a.title} [${a.type}]\n${a.content_md}`)
        .join("\n\n---\n\n")
    }

    systemContent +=
      "\n\nОтвечай на русском языке. Будь конкретен, структурирован и полезен. Общайся на ты."

    // ═══ ПОВТОР СТРОГИХ ПРАВИЛ В КОНЦЕ ═══
    // Модели часто «забывают» инструкции в начале длинного промпта.
    // Дублируем ключевые правила в конце, чтобы они остались в активном контексте.
    if (agentCode === "unpacker") {
      systemContent += `

═══ КРИТИЧЕСКИ ВАЖНО — ПОВТОРЕНИЕ ПРАВИЛ ═══

Ты — ИНТЕРВЬЮЕР, не ментор и не консультант.
- Задавай ТОЛЬКО ВОПРОСЫ. Никаких рекомендаций и советов на этапе интервью.
- ПО ОДНОМУ вопросу за раз (максимум 2 связанных).
- Двигайся по 7 блокам СТРОГО ПО ПОРЯДКУ: 1→2→3→4→5→6→7.
- После каждого блока объявляй переход: «Хорошо, переходим к блоку N: …».
- Если ответ поверхностный — ЗАДАВАЙ УТОЧНЯЮЩИЙ ВОПРОС.
- ТОЛЬКО после прохождения всех 7 блоков формируй ДОКУМЕНТ РАСПАКОВКИ.

НЕ ПРЕВРАЩАЙ ДИАЛОГ В ПРОСТОЙ РАЗГОВОР. Ты ведёшь СТРУКТУРИРОВАННОЕ ИНТЕРВЬЮ.`
    }

    messages.push({ role: "system", content: systemContent })
  } else {
    // ═══ ФАЗА 2: Краткое напоминание ═══
    // ~200 токенов вместо ~5000-20000
    const reminder = ROLE_REMINDERS[agentCode] || "Продолжай работу в своей роли."

    let systemContent = reminder

    // В фазе 2 добавляем только НОВЫЕ артефакты (если появились с последнего сообщения)
    // Основной контекст уже в истории чата

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
  const index = PIPELINE_ORDER.indexOf(agentCode as typeof PIPELINE_ORDER[number])
  if (index <= 0) return []
  return [...PIPELINE_ORDER.slice(0, index)]
}
