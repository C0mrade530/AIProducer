import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Target, TrendingUp, MessageSquare, Magnet, DollarSign, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const agents = [
  {
    icon: Sparkles,
    title: "Распаковка",
    description: "Раскрой свою экспертность, позиционирование и уникальность",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Target,
    title: "Продукт",
    description: "Создай оффер, модули, тарифы и структуру продукта",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: TrendingUp,
    title: "Продвижение",
    description: "Получи темы для Reels, hooks, CTA и контент-план",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: MessageSquare,
    title: "Прогрев",
    description: "Прогрей аудиторию через Stories, посты и сюжетные линии",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Magnet,
    title: "Лид-магниты",
    description: "Создай элитные лид-магниты и воронки для захвата лидов",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: DollarSign,
    title: "Продажи",
    description: "Скрипты, созвоны, переписка и high-ticket дожим",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: CheckCircle2,
    title: "Трекер",
    description: "Контроль прогресса, задачи и мотивация через Telegram",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">AIProducer</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                Войти
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="cursor-pointer">
                Начать бесплатно
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with gradient background */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in border border-primary/20">
              <Zap className="h-3.5 w-3.5" />
              7 AI-агентов для твоего продукта
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up">
              Создай и продай{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                онлайн-продукт
              </span>
              <br className="hidden sm:block" />
              {" "}с помощью AI
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
              От распаковки экспертности до первых продаж.
              Пошаговый AI-помощник проведёт тебя через весь путь — от идеи до запуска.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Начать бесплатно
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Первые 30 минут бесплатно • Без карты
              </p>
            </div>
          </div>

          {/* Visual Pipeline Preview */}
          <div className="relative max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <p className="text-sm font-medium text-muted-foreground">Твой путь к продукту за 7 шагов</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {agents.map((agent, i) => (
                  <div key={agent.title} className="flex flex-col items-center gap-2 group">
                    <div className={`relative h-14 w-14 rounded-xl ${agent.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <agent.icon className={`h-6 w-6 ${agent.color}`} />
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center leading-tight">{agent.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — Detailed Process */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">
              Как это работает?
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              7 AI-агентов работают последовательно, как конвейер.
              Каждый специализируется на своей задаче и передаёт результат следующему.
            </p>
          </div>

          {/* Process Flow */}
          <div className="space-y-8 sm:space-y-12">
            {agents.map((agent, i) => (
              <div
                key={agent.title}
                className="group relative"
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2 shrink-0">
                    <div className="relative">
                      <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ${agent.bg} flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg`}>
                        <agent.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${agent.color}`} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                        {i + 1}
                      </div>
                    </div>
                    {i < agents.length - 1 && (
                      <div className="hidden sm:block h-12 w-0.5 bg-gradient-to-b from-border to-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-card border rounded-xl p-6 sm:p-8 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-heading font-bold text-xl sm:text-2xl">
                        {agent.title}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap">
                        Шаг {i + 1}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium">
                        {i === agents.length - 1
                          ? "Готово к запуску!"
                          : `Передаёт результат агенту "${agents[i + 1].title}"`
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
            <div className="inline-block bg-card border rounded-2xl p-8 sm:p-12 shadow-lg">
              <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-4">
                Начни с первого агента прямо сейчас
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Первый агент — Распаковщик — поможет тебе определить экспертность и позиционирование за 30 минут
              </p>
              <Link href="/register">
                <Button size="xl" className="cursor-pointer shadow-lg shadow-primary/20">
                  Начать бесплатно
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Benefits */}
      <section className="py-16 sm:py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Почему AI Producer?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Все инструменты для создания и запуска продукта в одном месте
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Экспертный AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Claude Opus 4.6 — самая продвинутая модель для создания продуктов и контента
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Готовые артефакты
              </h3>
              <p className="text-sm text-muted-foreground">
                Получай сразу готовые документы: оффер, модули, контент-план, скрипты продаж
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Трекер-ментор
              </h3>
              <p className="text-sm text-muted-foreground">
                Личный AI-ментор отслеживает прогресс и мотивирует через Telegram
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border rounded-3xl p-8 sm:p-12 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />

            <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4">
              Готов создать свой продукт?
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Зарегистрируйся и начни с первого агента — Распаковщика.
              Это бесплатно и займёт всего 30 минут.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto cursor-pointer shadow-xl shadow-primary/20">
                  Начать сейчас
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Без кредитной карты</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-semibold">AIProducer</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AIProducer
          </p>
        </div>
      </footer>
    </div>
  )
}
