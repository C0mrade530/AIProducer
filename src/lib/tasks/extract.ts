import { callAgent, type AgentMessage } from "@/lib/agents/engine"

interface ExtractedTask {
  title: string
  description: string
  priority: number
  due_days: number | null
}

/**
 * Извлекает задачи из артефакта с помощью AI.
 * Работает для ЛЮБОГО агента — парсит конкретные действия.
 * Для tracker-агента возвращает полный план.
 */
export async function extractTasksFromArtifact(
  contentMd: string,
  agentCode: string
): Promise<ExtractedTask[]> {
  const messages: AgentMessage[] = [
    {
      role: "system",
      content: `Ты — парсер задач. Из текста артефакта извлеки конкретные ДЕЙСТВИЯ которые должен выполнить эксперт.

Правила:
- Извлекай только конкретные, выполнимые задачи (не абстракции)
- Для каждой задачи укажи приоритет (1=срочно, 2=важно, 3=обычно)
- Если можешь определить срок — укажи через сколько дней дедлайн (1-30)
- Максимум 10 задач на артефакт
- Для tracker-агента извлекай все задачи из плана
- Для других агентов — только ключевые следующие шаги

Ответь ТОЛЬКО валидным JSON массивом, без markdown:
[{"title":"Краткое название","description":"Подробнее","priority":1,"due_days":3}]`,
    },
    {
      role: "user",
      content: `Агент: ${agentCode}\n\nАртефакт:\n${contentMd.substring(0, 8000)}`,
    },
  ]

  try {
    const result = await callAgent(messages, {
      model: "claude-sonnet-4-6",
      temperature: 0.3,
      maxTokens: 2000,
    })

    // Parse JSON from response
    const jsonMatch = result.content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []

    const tasks = JSON.parse(jsonMatch[0]) as ExtractedTask[]
    return tasks.filter(
      (t) => t.title && t.title.length > 0 && t.title.length < 500
    )
  } catch (error) {
    console.error("Task extraction failed:", error)
    return []
  }
}
