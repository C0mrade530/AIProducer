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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            7 AI-агентов для твоего продукта
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-up">
            Создай и продай{" "}
            <span className="text-primary">онлайн-продукт</span>
            {" "}с помощью AI
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            От распаковки экспертности до первых продаж.
            Пошаговый AI-помощник, который проведёт тебя через весь путь.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register">
              <Button size="xl" className="w-full sm:w-auto cursor-pointer">
                Начать бесплатно
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — 7 agents */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              7 шагов к продукту
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Каждый агент решает одну задачу и передаёт результат следующему
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <div
                key={agent.title}
                className="group relative bg-card rounded-xl border p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl ${agent.bg} flex items-center justify-center shrink-0`}>
                    <agent.icon className={`h-6 w-6 ${agent.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Шаг {i + 1}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-1">
                      {agent.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Готов создать свой продукт?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Начни с распаковки — это бесплатно и займёт 30 минут
          </p>
          <Link href="/register">
            <Button size="xl" className="cursor-pointer">
              Начать сейчас
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
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
