"use client"

import { Button } from "@/components/ui/button"
import { X, Sparkles, ArrowRight, Zap, MessageCircle, Crown } from "lucide-react"
import Link from "next/link"

interface UpsellModalProps {
  open: boolean
  onClose: () => void
  variant: "free-ended" | "tracker" | "project-limit" | "subscription-expired"
}

const VARIANTS = {
  "free-ended": {
    icon: Sparkles,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    title: "Распаковка понравилась?",
    description:
      "Ты попробовал Распаковщика — а дальше ещё 6 агентов: Методолог создаст продукт, Маркетолог — контент-стратегию, а Трекер — план действий на каждый день.",
    cta: "Открыть все 7 агентов",
    price: "от 2 990 ₽/мес",
  },
  tracker: {
    icon: MessageCircle,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    title: "Telegram-трекер — только на Pro",
    description:
      "Трекер отправляет задачи в Telegram, мотивирует каждый день и следит за прогрессом. Доступен на тарифах Pro и Premium.",
    cta: "Перейти на Pro",
    price: "5 490 ₽/мес",
  },
  "project-limit": {
    icon: Zap,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    title: "Нужно больше проектов?",
    description:
      "На текущем тарифе лимит проектов исчерпан. Перейди на более высокий тариф для работы с несколькими продуктами одновременно.",
    cta: "Увеличить лимит",
    price: "от 5 490 ₽/мес",
  },
  "subscription-expired": {
    icon: Crown,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    title: "Подписка истекла",
    description:
      "Продли подписку, чтобы вернуть доступ к агентам и сохранённым артефактам. Все твои данные на месте.",
    cta: "Продлить подписку",
    price: "от 2 990 ₽/мес",
  },
}

export function UpsellModal({ open, onClose, variant }: UpsellModalProps) {
  if (!open) return null

  const config = VARIANTS[variant]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl border border-gray-800/60 shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-up">
        <div className="relative px-6 pt-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className={`h-14 w-14 rounded-2xl ${config.iconBg} flex items-center justify-center mb-4`}>
            <Icon className={`h-7 w-7 ${config.iconColor}`} />
          </div>

          <h2 className="font-heading text-xl font-bold mb-2">{config.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {config.description}
          </p>
        </div>

        <div className="px-6 py-5 bg-muted/20 border-t border-gray-800/40">
          <Link href="/pricing">
            <Button
              size="lg"
              className="w-full cursor-pointer shadow-lg shadow-primary/20"
              onClick={onClose}
            >
              {config.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {config.price} · Возврат в течение 3 дней
          </p>
        </div>
      </div>
    </div>
  )
}
