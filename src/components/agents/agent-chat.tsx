"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Sparkles,
  FileText,
  User,
  Save,
  ArrowRight,
  Check,
  X,
  ChevronRight,
  BookOpen,
  Download,
  Mic,
  Loader2,
  Pencil,
  FileDown,
} from "lucide-react"
import { AGENTS, type AgentConfig } from "@/lib/agents/constants"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
import { UpsellModal } from "@/components/upsell-modal"
import { readSSEStream } from "@/lib/stream-reader"

/**
 * Export artifact as branded PDF using jsPDF.
 * Content comes from our own AI-generated artifacts stored in the database.
 */
async function exportArtifactPdf(title: string, contentMd: string, agentName?: string) {
  const { default: jsPDF } = await import("jspdf")

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2
  const date = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

  // ── Colors ──
  const bg: [number, number, number] = [10, 10, 26]       // #0a0a1a
  const textMain: [number, number, number] = [230, 230, 240]
  const textMuted: [number, number, number] = [140, 140, 160]
  const accentViolet: [number, number, number] = [139, 92, 246]
  const accentBlue: [number, number, number] = [59, 130, 246]

  function drawBackground() {
    pdf.setFillColor(...bg)
    pdf.rect(0, 0, pageW, pageH, "F")
  }

  function drawFooter(pageNum: number, totalPages: number) {
    // Gradient line
    const lineY = pageH - 15
    pdf.setDrawColor(...accentViolet)
    pdf.setLineWidth(0.3)
    pdf.line(margin, lineY, pageW - margin, lineY)

    // Footer text
    pdf.setFontSize(8)
    pdf.setTextColor(...textMuted)
    pdf.text("getprodi.ru", margin, pageH - 10)
    pdf.text(`${pageNum} / ${totalPages}`, pageW - margin, pageH - 10, { align: "right" })
  }

  // ── Page 1: Cover ──
  drawBackground()

  // Logo mark (simple play triangle)
  const logoX = margin
  const logoY = 30
  pdf.setFillColor(255, 255, 255)
  pdf.triangle(logoX + 2, logoY, logoX + 12, logoY + 6, logoX + 2, logoY + 12, "F")

  // Brand name
  pdf.setFontSize(22)
  pdf.setTextColor(255, 255, 255)
  pdf.text("GetProdi", logoX + 16, logoY + 9)

  // Gradient accent line under header
  pdf.setDrawColor(...accentViolet)
  pdf.setLineWidth(0.8)
  pdf.line(margin, 50, margin + 60, 50)
  pdf.setDrawColor(...accentBlue)
  pdf.line(margin + 60, 50, margin + 100, 50)

  // Title
  pdf.setFontSize(20)
  pdf.setTextColor(...textMain)
  const titleLines = pdf.splitTextToSize(title, contentW)
  pdf.text(titleLines, margin, 65)

  // Meta info
  const metaY = 65 + titleLines.length * 9 + 8
  pdf.setFontSize(10)
  pdf.setTextColor(...textMuted)
  const metaParts = [date]
  if (agentName) metaParts.unshift(agentName)
  pdf.text(metaParts.join("  ·  "), margin, metaY)

  // Divider
  pdf.setDrawColor(...accentViolet)
  pdf.setLineWidth(0.3)
  pdf.line(margin, metaY + 5, pageW - margin, metaY + 5)

  // ── Content ──
  let cursorY = metaY + 14
  pdf.setFontSize(10)
  pdf.setTextColor(...textMain)

  const lines = contentMd.split("\n")
  let pageCount = 1

  for (const rawLine of lines) {
    const isHeading = /^#{1,3}\s/.test(rawLine)
    const cleanLine = rawLine.replace(/^#{1,3}\s/, "").replace(/\*\*/g, "")

    if (isHeading) {
      pdf.setFontSize(13)
      pdf.setTextColor(...accentViolet)
    } else {
      pdf.setFontSize(10)
      pdf.setTextColor(...textMain)
    }

    const wrapped = pdf.splitTextToSize(cleanLine || " ", contentW)
    const blockH = wrapped.length * (isHeading ? 6 : 5)

    // Check page break
    if (cursorY + blockH > pageH - 20) {
      drawFooter(pageCount, 0) // placeholder, will fix total later
      pdf.addPage()
      pageCount++
      drawBackground()
      cursorY = 20
    }

    pdf.text(wrapped, margin, cursorY)
    cursorY += blockH + (isHeading ? 4 : 2)
  }

  // ── Fix footers with correct total ──
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    if (i === 1) {
      // Cover page footer
      pdf.setFontSize(8)
      pdf.setTextColor(...textMuted)
      pdf.text("getprodi.ru", margin, pageH - 10)
    }
    drawFooter(i, totalPages)
  }

  // ── Download ──
  const safeFilename = title.replace(/[^\w\sа-яёА-ЯЁ-]/g, "").trim().substring(0, 50)
  pdf.save(`${safeFilename} — GetProdi.pdf`)
}

/**
 * Instant greetings — shown immediately while the server generates its full response.
 * Structured like real interview openers — sets the user's expectations clearly
 * that the agent will ask questions, not just chat.
 */
const AGENT_GREETINGS: Record<string, string> = {
  unpacker: `Привет! Я — твой стратег-распаковщик.

Моя задача — провести с тобой глубинный разбор: понять, кто ты как эксперт, что тебя блокирует изнутри и какой конкретный путь приведёт к прорыву.

Я буду задавать вопросы по 7 блокам: личность, ментальные блоки, продукт, продвижение, продажи, контент и стратегия. Отвечай честно — чем глубже ответы, тем точнее результат.

Начнём с первого блока — **Личность и контекст**.

**Вопрос 1:** Расскажи о себе так, как рассказал бы новому знакомому за 2 минуты. Кто ты, чем занимаешься, как давно в этой нише?`,
  methodologist: `Привет! Я — Методолог.

Я изучил результаты твоей распаковки и теперь мы создадим твой продукт — с чёткой структурой, методологией и офферами.

**Вопрос 1:** Какой формат продукта тебе ближе — курс, менторинг, консалтинг или групповая программа? И какой главный результат должен получить клиент после работы с тобой?`,
  promotion: `Привет! Я — Маркетолог.

На основе твоего продукта и позиционирования мы построим контент-стратегию, которая будет приводить клиентов.

**Вопрос 1:** На каких площадках ты сейчас присутствуешь (Instagram, Telegram, YouTube, другие)? Какой контент уже публикуешь и какой даёт лучший отклик?`,
  warmup: `Привет! Я — Прогревщик.

Мы выстроим систему прогрева, которая превращает холодную аудиторию в готовых платить клиентов.

**Вопрос 1:** Ты планируешь запуск к конкретной дате или хочешь вечнозелёную систему прогрева, которая работает постоянно?`,
  leadmagnet: `Привет! Я — Лид-магнитист.

Мы создадим бесплатный материал, который приведёт людей в твою воронку и покажет твою экспертизу.

**Вопрос 1:** Какую маленькую часть проблемы клиента ты можешь решить бесплатно — через чек-лист, гайд, мини-урок или аудит?`,
  sales: `Привет! Я — Продажник.

Мы напишем скрипты и выстроим процесс продаж, чтобы ты закрывал больше заявок в оплату — без ощущения «впаривания».

**Вопрос 1:** Как ты сейчас продаёшь — через переписку в Direct, созвоны, вебинары? И какой у тебя средний чек?`,
  tracker: `Привет! Я — Трекер.

Я проанализирую весь твой путь от распаковки до продаж и создам конкретный план на неделю с задачами и дедлайнами.

**Вопрос 1:** Что из материалов предыдущих агентов ты уже начал внедрять? С какими шагами есть сложности?`,
}

interface Message {
  role: string
  content: string
  created_at?: string
}

interface Artifact {
  id: string
  type: string
  title: string
  content_md: string
  status: string
}

interface AgentChatProps {
  agentCode: string
  agentConfig: AgentConfig
  projectId: string
  runId?: string
  initialMessages: Message[]
  artifacts: Artifact[]
}

export function AgentChat({
  agentCode,
  agentConfig,
  projectId,
  runId: initialRunId,
  initialMessages,
  artifacts: initialArtifacts,
}: AgentChatProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [runId, setRunId] = useState(initialRunId)
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
  const [showArtifacts, setShowArtifacts] = useState(initialArtifacts.length > 0)

  // Save artifact modal state
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveMessageIndex, setSaveMessageIndex] = useState<number | null>(null)
  const [artifactTitle, setArtifactTitle] = useState("")
  const [savingArtifact, setSavingArtifact] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Next agent prompt
  const [showNextAgent, setShowNextAgent] = useState(false)

  // Upsell modal
  const [showUpsell, setShowUpsell] = useState(false)
  const [upsellVariant, setUpsellVariant] = useState<"free-ended" | "tracker" | "project-limit" | "subscription-expired">("free-ended")

  // Artifact editing
  const [editingArtifactId, setEditingArtifactId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  // Voice recording
  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(text)
    // Auto-send after a tick so state updates
    setTimeout(() => {
      setInput("")
      setMessages((prev) => [...prev, { role: "user", content: text }])
      sendVoiceMessage(text)
    }, 50)
  }, [])

  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder({
    onTranscript: handleVoiceTranscript,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ═══ INSTANT GREETING with typewriter animation ═══
  // No server call — show the pre-written greeting immediately.
  // The real LLM conversation begins when the user sends their first message.
  const autoSentRef = useRef(false)
  const [isTypingGreeting, setIsTypingGreeting] = useState(false)

  useEffect(() => {
    if (messages.length === 0 && !autoSentRef.current && projectId) {
      autoSentRef.current = true
      showInstantGreeting()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, messages.length])

  const showInstantGreeting = () => {
    const greeting = AGENT_GREETINGS[agentCode] || "Привет! Давай начнём работу."
    setIsTypingGreeting(true)
    setMessages([{ role: "assistant", content: "" }])

    // Typewriter animation — reveal character by character
    let i = 0
    const speed = 8 // ms per character
    const interval = setInterval(() => {
      i++
      const current = greeting.slice(0, i)
      setMessages([{ role: "assistant", content: current }])
      if (i >= greeting.length) {
        clearInterval(interval)
        setIsTypingGreeting(false)
      }
    }, speed)
  }

  // Deprecated helper kept for reference (no longer called).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendAutoGreeting = async () => {
    setIsStreaming(true)
    setMessages([{ role: "assistant", content: "" }])

    try {
      const res = await fetch(`/api/agents/${agentCode}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__auto_greeting__",
          projectId,
          runId,
        }),
      })

      if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
          const errData = await res.json().catch(() => null)
          if (errData?.upsell) {
            const variant = res.status === 429 ? "project-limit"
              : agentCode === "unpacker" ? "free-ended"
              : "subscription-expired"
            setUpsellVariant(variant)
            setShowUpsell(true)
          }
          throw new Error(errData?.error || "Нет доступа")
        }
        throw new Error("Failed")
      }

      const newRunId = res.headers.get("X-Run-Id")
      if (newRunId) setRunId(newRunId)

      const reader = res.body?.getReader()
      if (reader) {
        let fullContent = ""
        await readSSEStream(reader, (delta) => {
          fullContent += delta
          setMessages([{ role: "assistant", content: fullContent }])
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      setMessages([{ role: "assistant", content: msg.includes("подписк") || msg.includes("тариф") || msg.includes("Лимит")
        ? `⚠️ ${msg}`
        : AGENT_GREETINGS[agentCode] || "Привет! Давай начнём работу. Расскажи о себе."
      }])
    } finally {
      setIsStreaming(false)
    }
  }

  // Get next agent in pipeline
  const nextAgent = AGENTS.find((a) => a.step === agentConfig.step + 1)

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsStreaming(true)

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    // On the very first user message, also send the pre-written greeting so
    // the server persists it as the first assistant message in history.
    const isFirstUserMessage = !runId
    const persistedGreeting = isFirstUserMessage ? AGENT_GREETINGS[agentCode] : undefined

    try {
      const res = await fetch(`/api/agents/${agentCode}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          projectId,
          runId,
          initialGreeting: persistedGreeting,
        }),
      })

      if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
          const errData = await res.json().catch(() => null)
          if (errData?.upsell) {
            const variant = res.status === 429 ? "project-limit"
              : agentCode === "unpacker" ? "free-ended"
              : "subscription-expired"
            setUpsellVariant(variant)
            setShowUpsell(true)
          }
          throw new Error(errData?.error || "Нет доступа")
        }
        throw new Error("Failed to send")
      }

      const newRunId = res.headers.get("X-Run-Id")
      if (newRunId && !runId) setRunId(newRunId)

      const reader = res.body?.getReader()
      if (reader) {
        let fullContent = ""
        await readSSEStream(reader, (delta) => {
          fullContent += delta
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: fullContent }
            return updated
          })
        })
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Произошла ошибка. Попробуйте ещё раз.",
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  // Send voice-transcribed message directly
  const sendVoiceMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return
    setIsStreaming(true)
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    try {
      const res = await fetch(`/api/agents/${agentCode}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, projectId, runId }),
      })

      if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
          const errData = await res.json().catch(() => null)
          if (errData?.upsell) {
            const variant = res.status === 429 ? "project-limit"
              : agentCode === "unpacker" ? "free-ended"
              : "subscription-expired"
            setUpsellVariant(variant)
            setShowUpsell(true)
          }
          throw new Error(errData?.error || "Нет доступа")
        }
        throw new Error("Failed to send")
      }

      const newRunId = res.headers.get("X-Run-Id")
      if (newRunId && !runId) setRunId(newRunId)

      const reader = res.body?.getReader()
      if (reader) {
        let fullContent = ""
        await readSSEStream(reader, (delta) => {
          fullContent += delta
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: fullContent }
            return updated
          })
        })
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: "assistant", content: "Произошла ошибка. Попробуйте ещё раз." }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ═══ SAVE ARTIFACT ═══
  const openSaveModal = (messageIndex: number) => {
    const msg = messages[messageIndex]
    if (!msg) return

    // Auto-generate title from first line
    const firstLine = msg.content.split("\n")[0].replace(/^[#*\s]+/, "").trim()
    setArtifactTitle(
      firstLine.length > 60 ? firstLine.substring(0, 60) + "..." : firstLine || `Результат ${agentConfig.name}`
    )
    setSaveMessageIndex(messageIndex)
    setShowSaveModal(true)
    setSavedSuccess(false)
  }

  const saveArtifact = async () => {
    if (saveMessageIndex === null || !artifactTitle.trim()) return
    setSavingArtifact(true)

    const msg = messages[saveMessageIndex]

    try {
      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          agentCode,
          runId,
          title: artifactTitle.trim(),
          type: agentCode + "_output",
          contentMd: msg.content,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setArtifacts((prev) => [...prev, data.artifact])
        setShowArtifacts(true)
        setSavedSuccess(true)
        setShowNextAgent(true)

        // FIX #5: Notify sidebar to refresh step data
        window.dispatchEvent(new Event("getprodi:step-updated"))

        setTimeout(() => {
          setShowSaveModal(false)
          setSaveMessageIndex(null)
        }, 1500)
      }
    } catch (error) {
      console.error("Save artifact error:", error)
    } finally {
      setSavingArtifact(false)
    }
  }

  const goToNextAgent = () => {
    if (nextAgent) {
      router.push(`/agent/${nextAgent.code}`)
    } else {
      router.push("/dashboard")
    }
  }

  const Icon = agentConfig.icon

  return (
    <div className="flex h-full">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Agent header */}
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-800/60 glass">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              agentConfig.bgColor
            )}
          >
            <Icon className={cn("h-5 w-5", agentConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-semibold">{agentConfig.name}</h2>
            <p className="text-xs text-muted-foreground truncate">
              {agentConfig.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArtifacts(!showArtifacts)}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Артефакты</span>
              {artifacts.length > 0 && (
                <Badge variant="default" className="ml-1 text-[10px] h-5 px-1.5">
                  {artifacts.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Messages — centered compact layout */}
        <div className="flex-1 overflow-y-auto py-3 md:py-4">
          <div className="max-w-2xl mx-auto px-4 md:px-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Агент готовится...</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className="group animate-fade-in"
            >
              {/* Sender label */}
              <div className="flex items-center gap-1.5 mb-1">
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Sparkles className={cn("h-3.5 w-3.5", agentConfig.color)} />
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  {msg.role === "user" ? "Ты" : agentConfig.name}
                </span>
              </div>
              {/* Message bubble */}
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-white/5 border border-white/10"
                    : "glass border border-gray-800/60 relative"
                )}
              >
                {msg.role === "assistant" && isStreaming && !msg.content && i === messages.length - 1 ? (
                  // Thinking indicator — three bouncing dots while waiting for first token
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-muted-foreground ml-2">{agentConfig.name} думает...</span>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.role === "assistant" &&
                      (isStreaming || isTypingGreeting) &&
                      i === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 bg-current opacity-50 animate-pulse ml-0.5" />
                      )}
                  </>
                )}
              </div>

              {/* Save as artifact button */}
              {msg.role === "assistant" &&
                msg.content.length > 100 &&
                !(isStreaming && i === messages.length - 1) && (
                  <button
                    onClick={() => openSaveModal(i)}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer opacity-0 group-hover:opacity-100 mt-1"
                  >
                    <Save className="h-3 w-3" />
                    Сохранить как артефакт
                  </button>
                )}
            </div>
          ))}

          {/* Next agent prompt */}
          {showNextAgent && nextAgent && (
            <div className="flex justify-center animate-fade-up">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 max-w-md text-center">
                <Check className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="font-heading font-semibold mb-1">
                  Артефакт сохранён!
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Результаты переданы следующему агенту
                </p>
                <Button
                  onClick={goToNextAgent}
                  className="cursor-pointer"
                  variant="accent"
                >
                  Перейти к «{nextAgent.name}»
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>{/* close max-w-2xl */}
        </div>

        {/* Input */}
        <div className="border-t border-gray-800/60 glass-strong px-4 md:px-6 py-3 md:py-4 pb-safe">
          <div className="relative max-w-2xl mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
              className="pr-24 pt-4 pb-4 min-h-[88px] max-h-[280px] resize-none rounded-2xl text-base bg-white/5 border-gray-800/60 focus:border-violet-500/40 placeholder:text-gray-500"
              rows={3}
              disabled={isStreaming}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
              {/* Voice recording button */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isStreaming || isTranscribing}
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                  isRecording
                    ? "bg-red-500/20 text-red-400 voice-recording-pulse"
                    : isTranscribing
                      ? "bg-white/5 text-muted-foreground"
                      : "bg-white/5 text-muted-foreground hover:text-primary hover:bg-white/10"
                )}
                title={isRecording ? "Остановить запись" : "Голосовой ввод"}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className={cn("h-4 w-4", isRecording && "animate-pulse")} />
                )}
              </button>
              {/* Send button */}
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="h-9 w-9 rounded-lg cursor-pointer shadow-[0_0_12px_hsl(262_85%_62%/0.3)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            {isRecording
              ? "Говорите... нажмите для остановки"
              : isTranscribing
                ? "Распознаю речь..."
                : isStreaming
                  ? "Агент думает..."
                  : "Enter — отправить, Shift+Enter — новая строка"}
          </p>
        </div>
      </div>

      {/* Artifacts panel — desktop: sidebar, mobile: modal overlay */}
      {showArtifacts && (
        <>
          {/* Mobile overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowArtifacts(false)}
          />

          <div className={cn(
            "border-l border-gray-800/60 glass-strong overflow-y-auto flex flex-col",
            // Desktop: sidebar
            "md:w-96 md:relative md:z-0",
            // Mobile: modal overlay from right
            "fixed top-0 right-0 bottom-0 w-full max-w-sm z-50"
          )}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-heading font-semibold text-sm">Артефакты</h3>
            </div>
            <button
              onClick={() => setShowArtifacts(false)}
              className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {artifacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <FileText className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Пока нет артефактов.
                  <br />
                  Наведите на сообщение агента и нажмите
                  <br />«Сохранить как артефакт»
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3 flex-1">
              {artifacts.map((artifact) => {
                const isEditing = editingArtifactId === artifact.id

                const startEdit = () => {
                  setEditingArtifactId(artifact.id)
                  setEditTitle(artifact.title)
                  setEditContent(artifact.content_md)
                }

                const cancelEdit = () => {
                  setEditingArtifactId(null)
                  setEditContent("")
                  setEditTitle("")
                }

                const saveEdit = async () => {
                  setSavingEdit(true)
                  try {
                    const res = await fetch("/api/artifacts", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        artifactId: artifact.id,
                        title: editTitle.trim(),
                        contentMd: editContent,
                      }),
                    })
                    if (res.ok) {
                      const data = await res.json()
                      setArtifacts((prev) =>
                        prev.map((a) => (a.id === artifact.id ? { ...a, title: data.artifact.title, content_md: data.artifact.content_md } : a))
                      )
                      setEditingArtifactId(null)
                    }
                  } catch (err) {
                    console.error("Edit artifact error:", err)
                  } finally {
                    setSavingEdit(false)
                  }
                }

                const exportMarkdown = () => {
                  const blob = new Blob([artifact.content_md], { type: "text/markdown" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${artifact.title.replace(/[^\w\sа-яёА-ЯЁ-]/g, "").trim()}.md`
                  a.click()
                  URL.revokeObjectURL(url)
                }

                return (
                  <div
                    key={artifact.id}
                    className="rounded-lg border p-4 space-y-2 hover:bg-muted/30 transition-colors"
                  >
                    {isEditing ? (
                      // ── Edit mode ──
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-sm font-medium"
                          placeholder="Название"
                        />
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="text-xs min-h-[120px] max-h-[300px] resize-y"
                          rows={6}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={saveEdit} loading={savingEdit} className="cursor-pointer">
                            <Save className="h-3 w-3" />
                            Сохранить
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit} className="cursor-pointer">
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // ── View mode ──
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium truncate">
                            {artifact.title}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={startEdit}
                              className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center cursor-pointer"
                              title="Редактировать"
                            >
                              <Pencil className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => exportArtifactPdf(artifact.title, artifact.content_md, agentConfig.name)}
                              className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center cursor-pointer"
                              title="Экспорт в PDF"
                            >
                              <Download className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <button
                              onClick={exportMarkdown}
                              className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center cursor-pointer"
                              title="Скачать .md"
                            >
                              <FileDown className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <Badge
                              variant={artifact.status === "final" ? "success" : "muted"}
                              className="text-[10px]"
                            >
                              {artifact.status === "final" ? "Готово" : "Черновик"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                          {artifact.content_md}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}

              {/* Go to next agent button */}
              {artifacts.length > 0 && nextAgent && (
                <div className="pt-3 border-t">
                  <Button
                    onClick={goToNextAgent}
                    variant="outline"
                    className="w-full cursor-pointer"
                    size="sm"
                  >
                    Перейти к «{nextAgent.name}»
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {artifacts.length > 0 && !nextAgent && (
                <div className="pt-3 border-t">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    className="w-full cursor-pointer"
                    size="sm"
                  >
                    Вернуться на Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        </>
      )}

      {/* Save artifact modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl border shadow-xl w-full max-w-md mx-4 overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                <h3 className="font-heading font-semibold">
                  Сохранить артефакт
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setSaveMessageIndex(null)
                }}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {savedSuccess ? (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-heading font-semibold">Сохранено!</p>
                  <p className="text-sm text-muted-foreground">
                    Артефакт передан в pipeline
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Название артефакта
                    </label>
                    <Input
                      value={artifactTitle}
                      onChange={(e) => setArtifactTitle(e.target.value)}
                      placeholder="Например: Полная распаковка эксперта"
                      autoFocus
                    />
                  </div>
                  {saveMessageIndex !== null && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Предпросмотр
                      </label>
                      <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-10">
                          {messages[saveMessageIndex]?.content}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!savedSuccess && (
              <div className="px-6 py-4 border-t bg-muted/30 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowSaveModal(false)
                    setSaveMessageIndex(null)
                  }}
                  className="cursor-pointer"
                >
                  Отмена
                </Button>
                <Button
                  onClick={saveArtifact}
                  loading={savingArtifact}
                  disabled={!artifactTitle.trim()}
                  className="cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upsell modal */}
      <UpsellModal
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        variant={upsellVariant}
      />
    </div>
  )
}
