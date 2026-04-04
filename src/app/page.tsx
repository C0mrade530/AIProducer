"use client"

import { ProdiLogo } from "@/components/brand/prodi-logo"
import { SplineHeroBackground } from "@/components/ui/spline-hero-bg"
import { ArrowRight, Zap, Target, TrendingUp, MessageSquare, Magnet, DollarSign, CheckCircle2, Sparkles, Star, Play, Users, FileText, Bot } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

const agents = [
  {
    icon: Sparkles,
    title: "Распаковка",
    description: "Поймёшь, в чём твоя сила, кто твоя аудитория и как себя позиционировать",
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    border: "border-violet-500/20",
  },
  {
    icon: Target,
    title: "Продукт",
    description: "Получишь готовый продукт: программу, модули, тарифы — бери и продавай",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Продвижение",
    description: "Получишь контент-план, темы для Reels, hooks и сценарии — на месяц вперёд",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/20",
  },
  {
    icon: MessageSquare,
    title: "Прогрев",
    description: "Получишь сценарии для Stories и посты, которые превращают подписчиков в покупателей",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/20",
  },
  {
    icon: Magnet,
    title: "Лид-магниты",
    description: "Получишь бесплатный продукт и воронку, которая собирает заявки на автопилоте",
    color: "text-pink-400",
    bg: "bg-pink-500/15",
    border: "border-pink-500/20",
  },
  {
    icon: DollarSign,
    title: "Продажи",
    description: "Получишь скрипты для переписок, созвонов и дожима — чтобы закрывать в оплату",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/20",
  },
  {
    icon: CheckCircle2,
    title: "Трекер",
    description: "AI-ментор не даст забросить: напомнит, подскажет и поддержит через Telegram",
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/20",
  },
]

export default function LandingPage() {
  const heroContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset
          const maxScroll = 500
          const opacity = 1 - Math.min(scrollPosition / maxScroll, 1)
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = opacity.toString()
          }
        })
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* Glassmorphism Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: "rgba(5, 5, 16, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "0 0 16px 16px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <ProdiLogo size={32} />
            <span className="font-heading text-lg font-bold text-white">GetProdi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block text-gray-300 hover:text-white text-sm transition-colors duration-150"
            >
              Войти
            </Link>
            <Link
              href="/pricing"
              className="hidden sm:inline-block text-gray-300 hover:text-white text-sm transition-colors duration-150"
            >
              Тарифы
            </Link>
            <Link
              href="/register"
              className="bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-2 px-6 rounded-xl text-sm border border-violet-500/30 transition-all duration-300 cursor-pointer"
              style={{ backdropFilter: "blur(8px)" }}
            >
              Попробовать
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Spline 3D Background */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <SplineHeroBackground />
        </div>

        <div
          ref={heroContentRef}
          className="absolute inset-0 z-10 flex items-center pointer-events-none"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl pt-16 sm:pt-0">
              <div className="inline-flex items-center gap-2 bg-violet-600/15 text-violet-300 rounded-xl px-4 py-1.5 text-sm font-medium mb-6 border border-violet-500/20 pointer-events-auto">
                <Zap className="h-3.5 w-3.5" />
                AI-продюсер для экспертов и блогеров
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-5 leading-[1.1] tracking-wide">
                Упакуй знания{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  в бизнес
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl mb-3 text-gray-300/90 max-w-xl leading-relaxed">
                Есть экспертность, но нет блога, продукта и понимания, как продавать?
              </p>
              <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-300/70 max-w-xl leading-relaxed">
                7 AI-агентов упакуют тебя с нуля: найдут позиционирование, соберут продукт, напишут контент-план, сценарии для Reels и скрипты продаж.
              </p>

              <div className="flex pointer-events-auto flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/register"
                  className="bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 w-full sm:w-auto border border-violet-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  Собрать свой продукт
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="bg-black/40 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                >
                  Смотреть тарифы
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                от 2 990 ₽/мес &bull; Без команды, без продюсера, без хаоса
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Preview */}
      <div className="bg-[#050510] relative z-10" style={{ marginTop: "-12vh" }}>
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-2xl overflow-hidden border border-gray-700/40 p-6 sm:p-8 shadow-2xl"
            style={{
              background: "rgba(15, 15, 30, 0.7)",
              backdropFilter: "blur(16px)",
            }}
          >
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

        {/* Before/After transformation */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">
                Было → Стало
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
                Что меняется после прохождения 7 шагов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div
                className="rounded-2xl p-6 sm:p-8 border border-red-500/20"
                style={{ background: "rgba(239, 68, 68, 0.05)" }}
              >
                <p className="text-red-400/80 text-sm font-semibold uppercase tracking-wider mb-5">Без GetProdi</p>
                <ul className="space-y-4">
                  {[
                    "«Я эксперт, но не знаю как себя подать»",
                    "Блога нет или ведётся хаотично, без плана",
                    "Нет продукта — непонятно, что продавать",
                    "Контент по вдохновению, Reels от случая к случаю",
                    "Нет воронки — люди приходят и уходят",
                    "Продажи в лоб или вообще нет продаж",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-400">
                      <span className="text-red-400/60 mt-0.5 shrink-0">✕</span>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* After */}
              <div
                className="rounded-2xl p-6 sm:p-8 border border-emerald-500/20"
                style={{ background: "rgba(16, 185, 129, 0.05)" }}
              >
                <p className="text-emerald-400/80 text-sm font-semibold uppercase tracking-wider mb-5">После GetProdi</p>
                <ul className="space-y-4">
                  {[
                    "Чёткое позиционирование — знаешь, кто ты и для кого",
                    "Контент-план на месяц + сценарии для Reels с hooks",
                    "Готовый продукт: программа, модули, тарифы",
                    "Воронка, которая собирает заявки на автопилоте",
                    "Прогрев через Stories — подписчики хотят купить",
                    "Скрипты продаж — закрываешь в оплату уверенно",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What you get — 7 agents */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 sm:mb-20">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">
                Что ты получишь?
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                7 AI-агентов — это твоя личная команда. Каждый решает свою задачу и передаёт результат следующему. Тебе не нужно разбираться — просто отвечай на вопросы.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {agents.map((agent, i) => (
                <div key={agent.title} className="group relative">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2 shrink-0">
                      <div className="relative">
                        <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ${agent.bg} border ${agent.border} flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/10`}>
                          <agent.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${agent.color}`} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                          {i + 1}
                        </div>
                      </div>
                      {i < agents.length - 1 && (
                        <div className="hidden sm:block h-10 w-0.5 bg-gradient-to-b from-gray-700 to-transparent" />
                      )}
                    </div>

                    <div
                      className="flex-1 rounded-xl p-6 sm:p-8 border border-gray-800/60 hover:border-gray-700/80 transition-all"
                      style={{ background: "rgba(15, 15, 30, 0.5)" }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                          {agent.title}
                        </h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-800/60 px-2.5 py-1 rounded-lg whitespace-nowrap">
                          Шаг {i + 1}
                        </span>
                      </div>
                      <p className="text-gray-400 leading-relaxed mb-4">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-violet-400">
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-medium">
                          {i === agents.length - 1
                            ? "Готово! У тебя всё собрано для запуска"
                            : `Результат уходит в следующий шаг — «${agents[i + 1].title}»`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA after process */}
            <div className="mt-16 text-center">
              <div
                className="inline-block rounded-2xl p-8 sm:p-12 border border-gray-800/60"
                style={{ background: "rgba(15, 15, 30, 0.6)" }}
              >
                <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-4 text-white">
                  Первый шаг — бесплатно занимает 30 минут
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Распаковщик задаст тебе вопросы и выдаст готовое позиционирование. Никаких знаний маркетинга не нужно — просто отвечай честно.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 border border-violet-500/30 cursor-pointer"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  Попробовать бесплатно
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why GetProdi — reframed as pain-killers */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-white">
                Почему это работает?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                GetProdi заменяет целую команду: продюсера, методолога, маркетолога, копирайтера и ментора
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className="rounded-xl p-6 border border-gray-800/60 hover:border-violet-500/30 transition-all group"
                style={{ background: "rgba(15, 15, 30, 0.5)" }}
              >
                <div className="h-12 w-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-white">
                  Не нужна команда
                </h3>
                <p className="text-sm text-gray-400">
                  Продюсер, методолог, маркетолог, копирайтер — всё это делают 7 AI-агентов. Тебе нужен только ты и твои знания.
                </p>
              </div>

              <div
                className="rounded-xl p-6 border border-gray-800/60 hover:border-blue-500/30 transition-all group"
                style={{ background: "rgba(15, 15, 30, 0.5)" }}
              >
                <div className="h-12 w-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-white">
                  Всё готово — бери и публикуй
                </h3>
                <p className="text-sm text-gray-400">
                  На выходе не советы, а конкретные документы: оффер, контент-план, сценарии Reels, скрипты продаж. Копируй и используй.
                </p>
              </div>

              <div
                className="rounded-xl p-6 border border-gray-800/60 hover:border-cyan-500/30 transition-all group"
                style={{ background: "rgba(15, 15, 30, 0.5)" }}
              >
                <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-white">
                  Не забросишь на полпути
                </h3>
                <p className="text-sm text-gray-400">
                  AI-трекер в Telegram напоминает о задачах, мотивирует и не даёт остановиться — как личный ментор, только доступный 24/7.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative overflow-hidden rounded-2xl p-8 sm:p-14 text-center border border-gray-800/60"
              style={{ background: "rgba(15, 15, 30, 0.6)" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-[100px] -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/15 rounded-full blur-[100px] -z-10" />

              <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">
                Хватит откладывать.
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Собери свой продукт сегодня.</span>
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                Тысячи экспертов сидят на знаниях, которые могли бы приносить деньги.
                Не будь одним из них. Начни прямо сейчас — первый шаг займёт 30 минут.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="bg-violet-600/20 hover:bg-violet-600/30 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 w-full sm:w-auto border border-violet-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  Собрать свой продукт
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="bg-black/40 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                >
                  Смотреть тарифы
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800/60 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ProdiLogo size={28} />
              <span className="font-heading text-sm font-semibold text-white">GetProdi</span>
              <span className="text-xs text-gray-600 hidden sm:inline">— упакуй знания в бизнес</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Оферта
              </Link>
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Конфиденциальность
              </Link>
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} GetProdi
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
