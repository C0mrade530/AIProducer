"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  FileText,
  Zap,
} from "lucide-react"

const TOUR_STEPS = [
  {
    title: "Добро пожаловать в AIProducer!",
    description:
      "7 AI-агентов помогут тебе создать и запустить онлайн-продукт. Каждый агент делает свою часть работы, а результаты автоматически передаются следующему.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Как это работает",
    description:
      "Ты общаешься с агентом в чате. Он задаёт вопросы, ты отвечаешь. В конце агент создаёт документ (артефакт) — ты сохраняешь его и переходишь к следующему агенту.",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    tips: [
      { icon: MessageSquare, text: "Отвечай подробно — агент подстроится" },
      { icon: FileText, text: "Сохраняй артефакты — они нужны другим агентам" },
      { icon: Zap, text: "Весь процесс занимает 2-3 часа" },
    ],
  },
  {
    title: "Начнём с Распаковщика",
    description:
      "Первый агент раскроет твою экспертность — кто ты, чем уникален, какие боли решаешь. Это фундамент для всего. Просто напиши «Привет» и следуй за агентом.",
    icon: ArrowRight,
    color: "text-primary",
    bg: "bg-primary/10",
    isFinal: true,
  },
]

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const current = TOUR_STEPS[step]
  const Icon = current.icon
  const isLast = step === TOUR_STEPS.length - 1
  const progress = ((step + 1) / TOUR_STEPS.length) * 100

  const handleNext = () => {
    if (isLast) {
      onComplete()
      router.push("/agent/unpacker")
    } else {
      setStep(step + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
    router.push("/agent/unpacker")
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-up">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div
            className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5",
              current.bg
            )}
          >
            <Icon className={cn("h-8 w-8", current.color)} />
          </div>

          <h2 className="font-heading text-2xl font-bold mb-3">
            {current.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {current.description}
          </p>

          {/* Tips for step 2 */}
          {"tips" in current && current.tips && (
            <div className="mt-5 space-y-2.5 text-left">
              {current.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-2.5"
                >
                  <tip.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{tip.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          {!isLast ? (
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Пропустить
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {/* Dots */}
            <div className="flex gap-1.5 mr-2">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step
                      ? "w-6 bg-primary"
                      : i < step
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>

            <Button onClick={handleNext} className="cursor-pointer">
              {isLast ? "Начать распаковку" : "Далее"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
