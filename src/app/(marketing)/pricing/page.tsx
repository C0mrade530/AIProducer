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
    name: "Старт",
    price: 2990,
    annualPrice: 28700,
    description: "Создай один онлайн-продукт с нуля",
    subtitle: "Для первого запуска",
    features: [
      "1 готовый продукт под ключ",
      "7 AI-агентов: распаковка, методология, маркетинг, прогрев, воронки, продажи, трекинг",
      "Сохранение результатов в PDF и Markdown",
      "История всех диалогов с агентами",
      "Email-поддержка в течение 24 часов",
    ],
    popular: false,
  },
  {
    key: "pro",
    name: "Про",
    price: 5490,
    annualPrice: 52700,
    description: "Запусти и масштабируй до 3 продуктов",
    subtitle: "Для серьёзного роста",
    features: [
      "До 3 одновременных продуктов (курсы, менторинг, консалтинг)",
      "Всё из тарифа «Старт»",
      "Ежедневный Telegram-помощник с задачами и мотивацией",
      "Свободный чат с AI-трекером без ограничений",
      "Приоритетная обработка запросов (работает быстрее)",
    ],
    popular: true,
  },
  {
    key: "premium",
    name: "Премиум",
    price: 8990,
    annualPrice: 86300,
    description: "Создай целую продуктовую линейку",
    subtitle: "Максимум возможностей",
    features: [
      "До 5 одновременных продуктов",
      "Всё из тарифа «Про»",
      "Claude Opus — самая мощная модель для финальных артефактов",
      "VIP-поддержка в Telegram",
      "Приоритетный доступ к новым функциям",
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
  const [isAnnual, setIsAnnual] = useState(false)
  const [paymentError, setPaymentError] = useState("")

  const handlePurchase = async (planKey: string) => {
    setLoading(planKey)
    setPaymentError("")

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing: isAnnual ? "annual" : "monthly" }),
      })

      // Not logged in → send to register
      if (res.status === 401) {
        router.push(`/register?next=/pricing`)
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        const errMsg = errData?.error || `Ошибка сервера (${res.status})`
        console.error("Payment error:", errMsg, errData)
        setPaymentError(errMsg)
        return
      }

      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setPaymentError("Не удалось получить ссылку на оплату. Попробуй ещё раз.")
    } catch (error) {
      console.error("Purchase error:", error)
      setPaymentError("Не удалось связаться с сервером. Проверь интернет и попробуй снова.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#000000" }}>
      {/* Nav */}
      <nav className="border-b border-gray-800/60" style={{ background: "rgba(5, 5, 16, 0.8)", backdropFilter: "blur(12px)" }}>
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
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            GetProdi — это 7 AI-агентов, которые за неделю помогут тебе:
            найти позиционирование, создать онлайн-продукт, написать
            контент-план, скрипты продаж и пошаговый план действий.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Это заменяет команду продюсера, методолога и маркетолога
            (~730 000 ₽/мес) одной подпиской.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 glass rounded-full border border-gray-800/60 p-1.5">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                !isAnnual ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
              )}
            >
              Месяц
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2",
                isAnnual ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
              )}
            >
              Год
              <span className="text-[10px] font-bold bg-success/20 text-success rounded-full px-2 py-0.5">
                -20%
              </span>
            </button>
          </div>
        </div>

        {paymentError && (
          <div className="max-w-2xl mx-auto mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
            <p className="text-sm text-destructive">{paymentError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={cn(
                "relative glass rounded-2xl border p-6 flex flex-col transition-all duration-200",
                plan.popular
                  ? "border-violet-500/40 glow-border shadow-lg shadow-violet-500/10 scale-[1.02]"
                  : "border-gray-800/60 hover:border-gray-700/60"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Популярный
                </Badge>
              )}

              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-1">
                  {plan.subtitle}
                </p>
                <h3 className="font-heading text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                {isAnnual ? (
                  <>
                    <span className="font-heading text-4xl font-bold">
                      {plan.annualPrice.toLocaleString("ru-RU")}
                    </span>
                    <span className="text-muted-foreground"> ₽/год</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(plan.annualPrice / 12).toLocaleString("ru-RU")} ₽/мес
                      <span className="text-success ml-1.5">экономия {((1 - plan.annualPrice / (plan.price * 12)) * 100).toFixed(0)}%</span>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="font-heading text-4xl font-bold">
                      {plan.price.toLocaleString("ru-RU")}
                    </span>
                    <span className="text-muted-foreground"> ₽/мес</span>
                  </>
                )}
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
