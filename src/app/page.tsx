"use client"

import { ProdiLogo } from "@/components/brand/prodi-logo"
import { SplineHeroBackground } from "@/components/ui/spline-hero-bg"
import { ArrowRight, Zap, Target, TrendingUp, MessageSquare, Magnet, DollarSign, CheckCircle2, Sparkles, Users, FileText, Bot, Check, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

/* ═══ DATA ═══ */

const agents = [
  {
    icon: Sparkles,
    title: "Распаковка",
    short: "Поймёшь, в чём твоя сила и как себя позиционировать",
    long: "AI задаст точные вопросы о твоём опыте, навыках и аудитории. На выходе — чёткое позиционирование, аватар клиента и уникальное торговое предложение. Больше никакого «я не знаю, как себя подать».",
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    border: "border-violet-500/20",
    glow: "violet",
  },
  {
    icon: Target,
    title: "Продукт",
    short: "Готовый продукт: программа, модули, тарифы",
    long: "Получишь структуру курса или менторства: модули, уроки, тарифы. AI создаёт оффер, который решает реальную боль аудитории. Не абстрактные идеи — конкретный продукт, готовый к продаже.",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/20",
    glow: "blue",
  },
  {
    icon: TrendingUp,
    title: "Продвижение",
    short: "Контент-план, темы для Reels, hooks и сценарии",
    long: "Контент-план на месяц, темы для Reels с hooks, сценарии для видео. Забудь про «что постить сегодня» — всё расписано. Каждая единица контента работает на продажу.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/20",
    glow: "emerald",
  },
  {
    icon: MessageSquare,
    title: "Прогрев",
    short: "Сценарии Stories и посты для прогрева аудитории",
    long: "Сценарии для Stories и постов, которые превращают холодных подписчиков в горячих покупателей. Пошаговая стратегия прогрева — от первого касания до момента «хочу купить».",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/20",
    glow: "orange",
  },
  {
    icon: Magnet,
    title: "Лид-магниты",
    short: "Воронка, которая собирает заявки на автопилоте",
    long: "Бесплатный продукт + автоматическая воронка. Люди приходят, получают ценность и оставляют заявки на автопилоте. Не нужно бегать за клиентами — они сами придут к тебе.",
    color: "text-pink-400",
    bg: "bg-pink-500/15",
    border: "border-pink-500/20",
    glow: "pink",
  },
  {
    icon: DollarSign,
    title: "Продажи",
    short: "Скрипты для переписок, созвонов и дожима",
    long: "Скрипты для переписок, созвонов и дожима. Ты знаешь что сказать в каждый момент — уверенно закрываешь в оплату. Больше никакого «я не умею продавать».",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/20",
    glow: "amber",
  },
  {
    icon: CheckCircle2,
    title: "Трекер",
    short: "AI-ментор не даст забросить — 24/7 в Telegram",
    long: "AI-ментор в Telegram. Напоминает о задачах, мотивирует, анализирует прогресс. Как личный наставник, который доступен 24/7 и не даёт тебе остановиться на полпути.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/20",
    glow: "cyan",
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

/* ═══ GLOW COLORS MAP ═══ */
const glowColors: Record<string, string> = {
  violet: "rgba(139, 92, 246, 0.15)",
  blue: "rgba(59, 130, 246, 0.15)",
  emerald: "rgba(16, 185, 129, 0.15)",
  orange: "rgba(249, 115, 22, 0.15)",
  pink: "rgba(236, 72, 153, 0.15)",
  amber: "rgba(245, 158, 11, 0.15)",
  cyan: "rgba(6, 182, 212, 0.15)",
}

/* ═══ PAGE ═══ */

export default function LandingPage() {
  const heroContentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // Hero scroll fade
  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        requestAnimationFrame(() => {
          const y = window.pageYOffset
          const opacity = 1 - Math.min(y / 500, 1)
          if (heroContentRef.current) heroContentRef.current.style.opacity = opacity.toString()
        })
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll-reveal for showcase sections
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-section")
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed") }),
      { threshold: 0.15 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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
        if (checkoutUrl) { window.location.href = checkoutUrl; return }
      }
      if (res.status === 401) { router.push("/register"); return }
    } catch (error) {
      console.error("Purchase error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden">
      {/* Star particles — covers entire page, visible through all sections */}
      <div className="starfield" style={{ height: "100%", position: "fixed" }}>
        <div className="star-layer" />
      </div>

      {/* ═══ NAV ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: "rgba(5, 5, 16, 0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: "0 0 16px 16px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <ProdiLogo size={32} />
            <span className="font-heading text-lg font-bold text-white">GetProdi</span>
          </Link>
          <div className="flex items-center gap-5">
            <a href="#pricing" className="hidden sm:inline-block text-gray-400 hover:text-white text-sm transition-colors">Планы</a>
            <Link href="/blog" className="hidden sm:inline-block text-gray-400 hover:text-white text-sm transition-colors">Блог</Link>
            <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">Войти</Link>
            <Link
              href="/register"
              className="bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-2 px-6 rounded-xl text-sm border border-violet-500/30 transition-all duration-300 cursor-pointer"
              style={{ backdropFilter: "blur(8px)" }}
            >
              Начать
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <SplineHeroBackground />
        </div>
        {/* Bottom fade — seamless blend into content */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] z-[5] pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 40%, rgba(0,0,0,1))" }} />
        <div ref={heroContentRef} className="absolute inset-0 z-10 flex items-center pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl pt-16 sm:pt-0">
              <div className="inline-flex items-center gap-2 bg-violet-600/15 text-violet-300 rounded-xl px-4 py-1.5 text-sm font-medium mb-6 border border-violet-500/20 pointer-events-auto">
                <Zap className="h-3.5 w-3.5" />
                Твой AI-продюсер
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-5 leading-[1.1] tracking-wide">
                Начни зарабатывать{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">на блоге</span>
                <br />без продюсера
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-300/80 max-w-xl leading-relaxed">
                Мы упаковали знания топовых экспертов по блогингу, Reels, продажам и менторству в 7 AI-агентов. Они сделают за тебя то, за что продюсер берёт 300к в месяц.
              </p>
              <div className="flex pointer-events-auto flex-col sm:flex-row items-start gap-3">
                <Link href="/register" className="bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 w-full sm:w-auto border border-violet-500/30 flex items-center justify-center gap-2 cursor-pointer" style={{ backdropFilter: "blur(8px)" }}>
                  Запустить AI-продюсера <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#pricing" className="bg-black/40 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer">
                  Смотреть тарифы
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-4">от 2 990 ₽/мес &bull; Вместо продюсера за 300к</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10" style={{ marginTop: "-8vh" }}>
        {/* Semi-transparent background — starfield particles visible through */}
        <div className="absolute inset-0 -z-20 bg-[#000000]/90" />

        {/* Ambient glow orbs */}
        <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[150px] -z-10 pointer-events-none" />
        <div className="absolute top-[25%] left-[5%] w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="absolute top-[50%] right-[15%] w-[350px] h-[350px] bg-violet-500/[0.04] rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-[75%] left-[10%] w-[450px] h-[450px] bg-blue-500/[0.04] rounded-full blur-[140px] -z-10 pointer-events-none" />

        {/* Pipeline mini-bar */}
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="glass rounded-2xl overflow-hidden border border-gray-700/40 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-medium text-gray-400">От «не знаю с чего начать» до готового продукта — за 7 шагов</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {agents.map((agent, i) => (
                <div key={agent.title} className="flex flex-col items-center gap-2 group">
                  <div className={`relative h-14 w-14 rounded-xl ${agent.bg} border ${agent.border} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <agent.icon className={`h-6 w-6 ${agent.color}`} />
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#0a0a1a] border-2 border-violet-500 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-300 text-center leading-tight">{agent.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transformation — row by row */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">Что изменится?</h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">До и после прохождения 7 шагов с AI-продюсером</p>
            </div>
            <div className="space-y-4">
              {[
                { before: "Не знаю как себя подать", after: "Чёткое позиционирование и аватар клиента" },
                { before: "Блог хаотичный, без плана", after: "Контент-план на месяц + сценарии Reels" },
                { before: "Нет продукта для продажи", after: "Готовый продукт: программа, модули, тарифы" },
                { before: "Нет воронки — люди уходят", after: "Воронка собирает заявки на автопилоте" },
                { before: "Подписчики не покупают", after: "Прогрев через Stories — хотят купить сами" },
                { before: "Не умею продавать", after: "Скрипты для переписок и созвонов" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-0 items-center">
                  <div className="glass rounded-xl px-5 py-4 border border-red-500/10 flex items-center gap-3">
                    <span className="text-red-400/50 text-lg shrink-0">&#x2715;</span>
                    <span className="text-sm text-gray-400">{row.before}</span>
                  </div>
                  <div className="hidden md:flex items-center justify-center px-4">
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="glass rounded-xl px-5 py-4 border border-emerald-500/15 flex items-center gap-3">
                    <span className="text-emerald-400 text-lg shrink-0">&#x2713;</span>
                    <span className="text-sm text-gray-200">{row.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ AGENT SHOWCASE — Antigravity-style ═══ */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">7 агентов. 7 шагов. Один результат.</h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">Каждый агент — специалист в своей области. Просто отвечай на вопросы, а AI сделает остальное.</p>
            </div>

            <div className="space-y-24 sm:space-y-32">
              {agents.map((agent, i) => {
                const isEven = i % 2 === 0
                return (
                  <div
                    key={agent.title}
                    className="reveal-section opacity-0 translate-y-8 transition-all duration-700 ease-out"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${!isEven ? "lg:direction-rtl" : ""}`}>
                      {/* Text side */}
                      <div className={!isEven ? "lg:order-2" : ""}>
                        <div className={`inline-flex items-center gap-2 ${agent.bg} ${agent.color} rounded-xl px-3 py-1 text-xs font-semibold mb-4 border ${agent.border}`}>
                          Шаг {i + 1} из 7
                        </div>
                        <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">{agent.title}</h3>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">{agent.long}</p>
                        <div className="accent-line mb-6" />
                        <p className="text-sm text-gray-500">
                          {i < agents.length - 1
                            ? `Результат передаётся агенту «${agents[i + 1].title}»`
                            : "Финальный шаг — у тебя всё готово для запуска"
                          }
                        </p>
                      </div>

                      {/* Visual side */}
                      <div className={!isEven ? "lg:order-1" : ""}>
                        <div
                          className="relative glass rounded-2xl border border-gray-800/60 aspect-[4/3] flex items-center justify-center overflow-hidden"
                        >
                          {/* Glow orbs */}
                          <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full blur-[80px] animate-glow-pulse" style={{ background: glowColors[agent.glow] }} />
                          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full blur-[60px] animate-glow-pulse" style={{ background: glowColors[agent.glow], animationDelay: "1.5s" }} />
                          {/* Icon */}
                          <div className={`relative z-10 ${agent.bg} border ${agent.border} rounded-3xl p-8 transition-transform hover:scale-105`}>
                            <agent.icon className={`h-16 w-16 sm:h-20 sm:w-20 ${agent.color}`} />
                          </div>
                          {/* Step number */}
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

        {/* ═══ COST COMPARISON ═══ */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">Сколько стоит команда?</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Посмотри, сколько платят за специалистов те, кто делает это без AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team cost */}
              <div className="glass rounded-2xl p-6 sm:p-8 border border-red-500/20">
                <p className="text-red-400/80 text-sm font-semibold uppercase tracking-wider mb-6">Нанимать команду</p>
                <ul className="space-y-4 mb-6">
                  {teamCosts.map((item) => (
                    <li key={item.role} className="flex items-center justify-between text-gray-300">
                      <span className="text-sm">{item.role}</span>
                      <span className="text-sm font-mono text-gray-400">{item.cost} ₽</span>
                    </li>
                  ))}
                </ul>
                <div className="accent-line mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Итого в месяц</span>
                  <span className="text-2xl font-heading font-bold text-red-400">~730 000 ₽</span>
                </div>
              </div>

              {/* GetProdi cost */}
              <div className="glow-card glass rounded-2xl p-6 sm:p-8 border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                <p className="text-emerald-400/80 text-sm font-semibold uppercase tracking-wider mb-6">С GetProdi</p>
                <p className="text-5xl sm:text-6xl font-heading font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">от 2 990</p>
                <p className="text-gray-400 text-lg mb-6">рублей в месяц</p>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                  <span className="glass rounded-lg px-3 py-1.5 border border-gray-800/40">7 AI-агентов</span>
                  <span className="glass rounded-lg px-3 py-1.5 border border-gray-800/40">Работает 24/7</span>
                  <span className="glass rounded-lg px-3 py-1.5 border border-gray-800/40">Без найма</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHY IT WORKS ═══ */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-white">Почему это работает?</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">GetProdi заменяет целую команду: продюсера, методолога, маркетолога, копирайтера и ментора</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/20", title: "Не нужна команда", desc: "Продюсер, методолог, маркетолог, копирайтер — всё это делают 7 AI-агентов. Тебе нужен только ты и твои знания." },
                { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/20", title: "Всё готово — бери и публикуй", desc: "На выходе не советы, а конкретные документы: оффер, контент-план, сценарии Reels, скрипты продаж." },
                { icon: Bot, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/20", title: "Не забросишь на полпути", desc: "AI-трекер в Telegram напоминает о задачах, мотивирует и не даёт остановиться — как личный ментор 24/7." },
              ].map((card) => (
                <div key={card.title} className="glass rounded-xl p-6 border border-gray-800/60 hover:border-gray-700/40 transition-all group">
                  <div className={`h-12 w-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-white">{card.title}</h3>
                  <p className="text-sm text-gray-400">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">Выбери свой тариф</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Начни с любого — все включают полный доступ к 7 AI-агентам</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.key}
                  className={`relative glass rounded-2xl border p-6 flex flex-col transition-all duration-200 ${
                    plan.popular
                      ? "border-violet-500/40 glow-border shadow-lg shadow-violet-500/10 scale-[1.02]"
                      : "border-gray-800/60 hover:border-gray-700/60"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Популярный</Badge>
                  )}
                  <div className="mb-6">
                    <h3 className="font-heading text-xl font-bold mb-1 text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-heading text-4xl font-bold text-white">{plan.price.toLocaleString("ru-RU")}</span>
                    <span className="text-gray-400"> ₽/мес</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePurchase(plan.key)}
                    disabled={loading === plan.key}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
                      plan.popular
                        ? "bg-violet-600/20 hover:bg-violet-600/30 text-white border border-violet-500/30"
                        : "bg-white/5 hover:bg-white/10 text-gray-200 border border-gray-700/60"
                    } ${loading === plan.key ? "opacity-50" : ""}`}
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    {loading === plan.key ? "Загрузка..." : `Выбрать ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden glass rounded-2xl p-8 sm:p-14 text-center border border-gray-800/60">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/15 rounded-full blur-[100px] -z-10" />
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">
                Твои знания стоят денег.
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Пора начать их продавать.</span>
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                7 AI-агентов с экспертизой лучших продюсеров мира. Позиционирование, продукт, контент, воронка и продажи — всё в одном месте.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register" className="bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 w-full sm:w-auto border border-violet-500/30 flex items-center justify-center gap-2 cursor-pointer" style={{ backdropFilter: "blur(8px)" }}>
                  Запустить AI-продюсера <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#pricing" className="bg-black/40 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer">
                  Смотреть тарифы
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-gray-800/60 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ProdiLogo size={28} />
              <span className="font-heading text-sm font-semibold text-white">GetProdi</span>
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

      {/* Scroll-reveal CSS */}
      <style jsx>{`
        .reveal-section.revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  )
}
