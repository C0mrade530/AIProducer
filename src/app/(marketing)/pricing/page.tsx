"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import { Check, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: 2990,
    description: "Для первого запуска",
    features: [
      "1 распаковка (проект)",
      "Все 7 AI-агентов",
      "Сохранение артефактов",
      "Экспорт результатов",
      "Базовый трекер задач",
    ],
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 5490,
    description: "Для серьёзного роста",
    features: [
      "3 распаковки (проекта)",
      "Все 7 AI-агентов",
      "Telegram-трекер",
      "Свободный чат с трекером",
      "Приоритетная генерация",
      "Экспорт результатов",
    ],
    popular: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: 8990,
    description: "Максимум возможностей",
    features: [
      "5 распаковок (проектов)",
      "Все 7 AI-агентов",
      "Telegram-трекер",
      "Свободный чат с трекером",
      "Opus для артефактов",
      "Экспорт результатов",
      "Приоритетная поддержка",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PricingContent />
    </Suspense>
  )
}

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOnboarding = searchParams.get("onboarding") === "1"
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (planKey: string) => {
    setLoading(planKey)
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      })

      if (res.ok) {
        const { checkoutUrl } = await res.json()
        if (checkoutUrl) {
          window.location.href = checkoutUrl
          return
        }
      }

      // If not logged in, redirect to register
      if (res.status === 401) {
        router.push("/register")
        return
      }
    } catch (error) {
      console.error("Purchase error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <ProdiLogo size={36} />
            <span className="font-heading text-xl font-bold">GetProdi</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {fromOnboarding && (
            <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-1.5 text-sm font-medium mb-4 border border-success/20">
              <Check className="h-3.5 w-3.5" />
              Аккаунт создан! Осталось выбрать тариф
            </div>
          )}
          <h1 className="font-heading text-4xl font-bold mb-3">
            Выбери свой тариф
          </h1>
          <p className="text-lg text-muted-foreground">
            {fromOnboarding
              ? "Выбери тариф и начни работу с AI-агентами прямо сейчас"
              : "Начни создавать онлайн-продукт с AI уже сегодня"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col transition-all duration-200",
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                  : "hover:border-muted-foreground/30"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Популярный
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="font-heading text-4xl font-bold">
                  {plan.price.toLocaleString("ru-RU")}
                </span>
                <span className="text-muted-foreground"> ₽/мес</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePurchase(plan.key)}
                loading={loading === plan.key}
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                className="w-full cursor-pointer"
              >
                Выбрать {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
