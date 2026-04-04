"use client"

import { ProdiLogo } from "@/components/brand/prodi-logo"
import { SplineHeroBackground } from "@/components/ui/spline-hero-bg"
import { ArrowRight, Zap, Target, TrendingUp, MessageSquare, Magnet, DollarSign, CheckCircle2, Sparkles, Check, Shield, Clock, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

/* ═══ DATA ═══ */

const agents = [
  {
    icon: Sparkles, title: "Распаковка",
    short: "Поймёшь, в чём твоя сила и как себя позиционировать",
    long: "AI задаст точные вопросы о твоём опыте, навыках и аудитории. На выходе — чёткое позиционирование, аватар клиента и уникальное торговое предложение. Больше никакого «я не знаю, как себя подать».",
    color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/20", glow: "violet",
  },
  {
    icon: Target, title: "Продукт",
    short: "Готовый продукт: программа, модули, тарифы",
    long: "Получишь структуру курса или менторства: модули, уроки, тарифы. AI создаёт оффер, который решает реальную боль аудитории. Не абстрактные идеи — конкретный продукт, готовый к продаже.",
    color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/20", glow: "blue",
  },
  {
    icon: TrendingUp, title: "Продвижение",
    short: "Контент-план, темы для Reels, hooks и сценарии",
    long: "Контент-план на месяц, темы для Reels с hooks, сценарии для видео. Забудь про «что постить сегодня» — всё расписано. Каждая единица контента работает на продажу.",
    color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/20", glow: "emerald",
  },
  {
    icon: MessageSquare, title: "Прогрев",
    short: "Сценарии Stories и посты для прогрева аудитории",
    long: "Сценарии для Stories и постов, которые превращают холодных подписчиков в горячих покупателей. Пошаговая стратегия прогрева — от первого касания до момента «хочу купить».",
    color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/20", glow: "orange",
  },
  {
    icon: Magnet, title: "Лид-магниты",
    short: "Воронка, которая собирает заявки на автопилоте",
    long: "Бесплатный продукт + автоматическая воронка. Люди приходят, получают ценность и оставляют заявки на автопилоте. Не нужно бегать за клиентами — они сами придут к тебе.",
    color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/20", glow: "pink",
  },
  {
    icon: DollarSign, title: "Продажи",
    short: "Скрипты для переписок, созвонов и дожима",
    long: "Скрипты для переписок, созвонов и дожима. Ты знаешь что сказать в каждый момент — уверенно закрываешь в оплату. Больше никакого «я не умею продавать».",
    color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/20", glow: "amber",
  },
  {
    icon: CheckCircle2, title: "Трекер",
    short: "AI-ментор не даст забросить — 24/7 в Telegram",
    long: "AI-ментор в Telegram. Напоминает о задачах, мотивирует, анализирует прогресс. Как личный наставник, который доступен 24/7 и не даёт тебе остановиться на полпути.",
    color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/20", glow: "cyan",
  },
]

const teamCosts = [
  { role: "Продюсер", cost: "300 000" },
  { role: "Методолог", cost: "150 000" },
  { role: "Маркетолог", cost: "100 000" },
  { role: "Копирайтер", cost: "80 000" },
  { role: "Ментор", cost: "100 000" },
]

const plans = [
  { key: "starter", name: "Starter", price: 2990, description: "Для первого запуска", features: ["1 проект", "Все 7 AI-агентов", "Экспорт артефактов", "Базовый трекер"], popular: false },
  { key: "pro", name: "Pro", price: 5490, description: "Для серьёзного роста", features: ["3 проекта", "Все 7 AI-агентов", "Telegram-трекер", "Свободный чат с AI", "Приоритетная генерация"], popular: true },
  { key: "premium", name: "Premium", price: 8990, description: "Максимум возможностей", features: ["5 проектов", "Все 7 AI-агентов", "Telegram-трекер", "Opus для артефактов", "Приоритетная поддержка"], popular: false },
]

const glowColors: Record<string, string> = {
  violet: "rgba(139,92,246,0.15)", blue: "rgba(59,130,246,0.15)", emerald: "rgba(16,185,129,0.15)",
  orange: "rgba(249,115,22,0.15)", pink: "rgba(236,72,153,0.15)", amber: "rgba(245,158,11,0.15)", cyan: "rgba(6,182,212,0.15)",
}

/* ═══ PAGE — Ben Hunt's Awareness Ladder ═══ */

export default function LandingPage() {
  const heroContentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        requestAnimationFrame(() => {
          const y = window.pageYOffset
          if (heroContentRef.current) heroContentRef.current.style.opacity = (1 - Math.min(y / 500, 1)).toString()
        })
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll(".reveal-section")
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed") }), { threshold: 0.15 })
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const handlePurchase = async (planKey: string) => {
    setLoading(planKey)
    try {
      const res = await fetch("/api/payments/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planKey }) })
      if (res.ok) { const { checkoutUrl } = await res.json(); if (checkoutUrl) { window.location.href = checkoutUrl; return } }
      if (res.status === 401) { router.push("/register"); return }
    } catch (e) { console.error(e) } finally { setLoading(null) }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden">
      <div className="starfield" style={{ height: "100%", position: "fixed" }}><div className="star-layer" /></div>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5"><ProdiLogo size={32} /><span className="font-heading text-lg font-bold">GetProdi</span></Link>
          <div className="flex items-center gap-5">
            <a href="#pricing" className="hidden sm:inline-block text-gray-400 hover:text-white text-sm transition-colors">Тарифы</a>
            <Link href="/blog" className="hidden sm:inline-block text-gray-400 hover:text-white text-sm transition-colors">Блог</Link>
            <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">Войти</Link>
            <Link href="/register" className="bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-6 rounded-xl text-sm border border-white/10 transition-all cursor-pointer">Начать бесплатно</Link>
          </div>
        </div>
      </nav>

      {/* ═══ 1. HERO — Уровень 0-1: Привлечь внимание ═══ */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-auto"><SplineHeroBackground /></div>
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] z-[5] pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 40%, #000)" }} />
        <div ref={heroContentRef} className="absolute inset-0 z-10 flex items-center pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl pt-16 sm:pt-0">
              <div className="inline-flex items-center gap-2 bg-white/5 text-violet-300 rounded-xl px-4 py-1.5 text-sm font-medium mb-6 border border-white/10 pointer-events-auto">
                <Zap className="h-3.5 w-3.5" />
                AI-продюсер для экспертов
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-5 leading-[1.1]">
                Твои знания уже{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">стоят денег.</span>
                <br />Осталось их упаковать.
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-300/80 max-w-xl leading-relaxed">
                AI-продюсер создаст тебе продукт, контент-план, воронку и скрипты продаж — за дни, а не месяцы. Без команды, без бюджета.
              </p>
              <div className="flex pointer-events-auto flex-col sm:flex-row items-start gap-3">
                <Link href="/register" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-600/25">
                  Начать бесплатно <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#pricing" className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-medium py-3.5 px-8 rounded-xl transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer">
                  Смотреть тарифы
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-4">Регистрация за 30 сек &bull; Без карты &bull; от 2 990 ₽/мес</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10" style={{ marginTop: "-8vh" }}>
        <div className="absolute inset-0 -z-20 bg-black/90" />
        <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-violet-600/[0.04] rounded-full blur-[150px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-[5%] w-[400px] h-[400px] bg-blue-600/[0.03] rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="absolute top-[70%] right-[15%] w-[350px] h-[350px] bg-violet-500/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* ═══ 2. SOCIAL PROOF — Уровень 1: Вызвать доверие ═══ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="glass rounded-2xl border border-gray-800/40 p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-white">7</p>
              <p className="text-xs text-gray-400 mt-1">AI-агентов внутри</p>
            </div>
            <div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-white">24/7</p>
              <p className="text-xs text-gray-400 mt-1">доступен всегда</p>
            </div>
            <div>
              <p className="font-heading text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">x100</p>
              <p className="text-xs text-gray-400 mt-1">дешевле продюсера</p>
            </div>
            <div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-white">7 дней</p>
              <p className="text-xs text-gray-400 mt-1">до результата</p>
            </div>
          </div>
        </section>

        {/* ═══ 3. БОЛИ → РЕШЕНИЯ — Уровень 2: Показать проблему и решение ═══ */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">Знакомо?</h2>
              <p className="text-gray-400 text-lg">Большинство экспертов застревают здесь. GetProdi решает каждую из этих проблем.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { pain: "«Не знаю что продавать и как себя подать»", fix: "AI-распаковщик находит твоё позиционирование и создаёт оффер за 1 сессию", icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10" },
                { pain: "«Не знаю что постить и как вести блог»", fix: "Контент-план на месяц + сценарии Reels с hooks — копируй и публикуй", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { pain: "«Подписчики есть, но никто не покупает»", fix: "Воронка + прогрев + скрипты продаж — система, которая закрывает в оплату", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <div key={i} className="glass rounded-2xl border border-gray-800/40 p-6 flex flex-col">
                  <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <p className="text-sm text-red-400/70 mb-3 italic">{item.pain}</p>
                  <div className="accent-line mb-3" />
                  <p className="text-sm text-gray-200 flex-1">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 4. AGENT SHOWCASE — Уровень 3: Показать продукт ═══ */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">7 агентов. 7 шагов. Один результат.</h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">Каждый агент — специалист в своей области. Просто отвечай на вопросы, а AI сделает остальное.</p>
            </div>
            <div className="space-y-24 sm:space-y-32">
              {agents.map((agent, i) => {
                const isEven = i % 2 === 0
                return (
                  <div key={agent.title} className="reveal-section opacity-0 translate-y-8 transition-all duration-700 ease-out" style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
                      <div className={!isEven ? "lg:order-2" : ""}>
                        <div className={`inline-flex items-center gap-2 ${agent.bg} ${agent.color} rounded-xl px-3 py-1 text-xs font-semibold mb-4 border ${agent.border}`}>Шаг {i + 1} из 7</div>
                        <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{agent.title}</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">{agent.long}</p>
                        <div className="accent-line mb-6" />
                        <p className="text-sm text-gray-500">{i < agents.length - 1 ? `Результат передаётся агенту «${agents[i + 1].title}»` : "Финальный шаг — у тебя всё готово для запуска"}</p>
                      </div>
                      <div className={!isEven ? "lg:order-1" : ""}>
                        <div className="relative glass rounded-2xl border border-gray-800/60 aspect-[4/3] flex items-center justify-center overflow-hidden">
                          <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full blur-[80px] animate-glow-pulse" style={{ background: glowColors[agent.glow] }} />
                          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full blur-[60px] animate-glow-pulse" style={{ background: glowColors[agent.glow], animationDelay: "1.5s" }} />
                          <div className={`relative z-10 ${agent.bg} border ${agent.border} rounded-3xl p-8 transition-transform hover:scale-105`}>
                            <agent.icon className={`h-16 w-16 sm:h-20 sm:w-20 ${agent.color}`} />
                          </div>
                          <div className="absolute top-4 right-4 text-[120px] font-heading font-bold text-white/[0.03] leading-none select-none">{i + 1}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══ 5. COST COMPARISON — Уровень 4: Обосновать цену ═══ */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">Продюсер или AI?</h2>
              <p className="text-gray-400 text-lg">Сравни стоимость команды специалистов с GetProdi</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6 sm:p-8 border border-red-500/20">
                <p className="text-red-400/80 text-sm font-semibold uppercase tracking-wider mb-6">Нанимать команду</p>
                <ul className="space-y-4 mb-6">
                  {teamCosts.map((item) => (
                    <li key={item.role} className="flex items-center justify-between"><span className="text-sm text-gray-300">{item.role}</span><span className="text-sm font-mono text-gray-400">{item.cost} ₽</span></li>
                  ))}
                </ul>
                <div className="accent-line mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Итого</span>
                  <span className="text-2xl font-heading font-bold text-red-400">~730 000 ₽/мес</span>
                </div>
              </div>
              <div className="glow-card glass rounded-2xl p-6 sm:p-8 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                <p className="text-emerald-400/80 text-sm font-semibold uppercase tracking-wider mb-6">С GetProdi</p>
                <p className="text-5xl sm:text-6xl font-heading font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">от 2 990</p>
                <p className="text-gray-400 text-lg mb-6">рублей в месяц</p>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                  <span className="glass rounded-lg px-3 py-1.5 border border-gray-800/40">7 AI-агентов</span>
                  <span className="glass rounded-lg px-3 py-1.5 border border-gray-800/40">24/7</span>
                  <span className="glass rounded-lg px-3 py-1.5 border border-gray-800/40">Без найма</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 6. TRIGGERS — Уровень 4: Снять возражения ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Shield, text: "Возврат в течение 3 дней", sub: "Если не понравится — вернём деньги без вопросов" },
              { icon: Clock, text: "Результат за 7 дней", sub: "Полная упаковка: от позиционирования до скриптов продаж" },
              { icon: Flame, text: "Старт за 30 секунд", sub: "Регистрация без карты. Просто email и пароль" },
            ].map((t) => (
              <div key={t.text} className="glass rounded-xl border border-gray-800/40 p-5 text-center">
                <t.icon className="h-6 w-6 text-violet-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">{t.text}</p>
                <p className="text-xs text-gray-500">{t.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 7. PRICING — Уровень 5: Закрыть в действие ═══ */}
        <section id="pricing" className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">Выбери свой тариф</h2>
              <p className="text-gray-400 text-lg">Все тарифы включают полный доступ к 7 AI-агентам</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.key} className={`relative glass rounded-2xl border p-6 flex flex-col transition-all duration-200 ${plan.popular ? "border-violet-500/40 glow-border shadow-lg shadow-violet-500/10 scale-[1.02]" : "border-gray-800/60 hover:border-gray-700/60"}`}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Популярный</Badge>}
                  <div className="mb-6">
                    <h3 className="font-heading text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-heading text-4xl font-bold">{plan.price.toLocaleString("ru-RU")}</span>
                    <span className="text-gray-400"> ₽/мес</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm text-gray-300"><Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /><span>{f}</span></li>))}
                  </ul>
                  <button onClick={() => handlePurchase(plan.key)} disabled={loading === plan.key} className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all cursor-pointer ${plan.popular ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25" : "bg-white/5 hover:bg-white/10 text-gray-200 border border-gray-700/60"} ${loading === plan.key ? "opacity-50" : ""}`}>
                    {loading === plan.key ? "..." : `Выбрать ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-600 mt-6">Возврат в течение 3 дней, если не использовал агентов</p>
          </div>
        </section>

        {/* ═══ 8. FINAL CTA — FOMO + действие ═══ */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden glass rounded-2xl p-8 sm:p-14 text-center border border-gray-800/60">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/15 rounded-full blur-[100px] -z-10" />
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">
                Каждый день без системы —
                <br /><span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">потерянные деньги.</span>
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
                Пока ты думаешь, другие эксперты уже запускают продукты с AI. Начни сегодня — первый результат через 30 минут.
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 px-10 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/25 text-lg">
                Начать бесплатно <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-xs text-gray-600 mt-4">Без карты. Регистрация за 30 секунд.</p>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-gray-800/60 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ProdiLogo size={28} /><span className="font-heading text-sm font-semibold">GetProdi</span>
              <span className="text-xs text-gray-600 hidden sm:inline">— твой AI-продюсер</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Оферта</Link>
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Конфиденциальность</Link>
              <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} GetProdi</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`.reveal-section.revealed { opacity: 1 !important; transform: translateY(0) !important; }`}</style>
    </div>
  )
}
