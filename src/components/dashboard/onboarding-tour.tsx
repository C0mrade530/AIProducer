"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Magnet,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  X,
} from "lucide-react"

const TOUR_STEPS = [
  {
    title: "Добро пожаловать в AIProducer!",
    description: "Это твой личный AI-продюсер. 7 умных агентов помогут создать и продать онлайн-продукт. Давай я покажу, как всё устроено.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "1. Распаковщик",
    description: "Первый агент раскроет твою экспертность: кто ты, чем уникален, какие боли решаешь. Это фундамент для всего остального.",
    icon: Sparkles,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "2. Методолог",
    description: "На основе распаковки создаст структуру продукта: оффер, модули, тарифы. Ты получишь готовый продуктовый паспорт.",
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "3. Продвижение",
    description: "Сгенерирует 30+ тем для Reels, контент-план, hooks и CTA. Больше не нужно ломать голову, что постить.",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "4. Прогревщик",
    description: "Выстроит стратегию прогрева аудитории: Stories, посты, сюжетные линии. Чтобы к моменту продажи люди уже хотели купить.",
    icon: MessageSquare,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "5. Лид-магниты",
    description: "Создаст элитные лид-магниты и воронки: от первого касания до заявки. Бесплатные материалы, которые продают за тебя.",
    icon: Magnet,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "6. Продажник",
    description: "Напишет скрипты продаж, обработку возражений, follow-up. Для созвонов, переписки и high-ticket.",
    icon: DollarSign,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "7. Трекер",
    description: "Будет следить за твоим прогрессом, создавать задачи и напоминать через Telegram. Чтобы ты не забросил на полпути.",
    icon: CheckCircle2,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Готов? Начни с Распаковщика!",
    description: "Каждый следующий агент использует результаты предыдущего. Поэтому начинаем с распаковки — это займёт ~30 минут, и ты удивишься, сколько узнаешь о себе.",
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
    // Animate in
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
          <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5", current.bg)}>
            <Icon className={cn("h-8 w-8", current.color)} />
          </div>

          <h2 className="font-heading text-2xl font-bold mb-3">
            {current.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {current.description}
          </p>
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
                    i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20"
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
