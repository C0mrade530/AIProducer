import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  Magnet,
  DollarSign,
  CheckCircle2,
  Users,
  Clock,
  Shield,
  Smartphone,
  Check,
} from "lucide-react"
import Link from "next/link"

const agents = [
  {
    icon: Sparkles,
    title: "Распаковка",
    description: "Раскрой свою экспертность, позиционирование и уникальность",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    output: "Документ распаковки",
  },
  {
    icon: Target,
    title: "Продукт",
    description: "Создай оффер, модули, тарифы и структуру продукта",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    output: "Продуктовый паспорт",
  },
  {
    icon: TrendingUp,
    title: "Продвижение",
    description: "Получи темы для Reels, hooks, CTA и контент-план",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    output: "Контент-план",
  },
  {
    icon: MessageSquare,
    title: "Прогрев",
    description: "Прогрей аудиторию через Stories, посты и сюжетные линии",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    output: "Стратегия прогрева",
  },
  {
    icon: Magnet,
    title: "Лид-магниты",
    description: "Создай лид-магниты и воронки для захвата лидов",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    output: "Карта воронок",
  },
  {
    icon: DollarSign,
    title: "Продажи",
    description: "Скрипты, созвоны, переписка и high-ticket дожим",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    output: "Продажный пакет",
  },
  {
    icon: CheckCircle2,
    title: "Трекер",
    description: "Контроль прогресса, задачи и мотивация через Telegram",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    output: "План действий",
  },
]

const forWhom = [
  {
    title: "Эксперты и коучи",
    description: "Упакуй свои знания в продукт и начни продавать",
  },
  {
    title: "Блогеры и инфлюенсеры",
    description: "Монетизируй аудиторию через инфопродукт",
  },
  {
    title: "Предприниматели",
    description: "Запусти образовательный продукт как новое направление",
  },
  {
    title: "Фрилансеры",
    description: "Выйди из обмена «время на деньги» с онлайн-курсом",
  },
]

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: 2990,
    period: "/мес",
    description: "Для первого запуска",
    features: [
      "1 распаковка (проект)",
      "Все 7 AI-агентов",
      "Экспорт артефактов",
      "Базовый трекер задач",
    ],
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 5490,
    period: "/мес",
    description: "Для серьёзного роста",
    features: [
      "3 распаковки (проекта)",
      "Все 7 AI-агентов",
      "Telegram-трекер и мотивация",
      "Свободный чат с трекером",
      "Приоритетная генерация",
    ],
    popular: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: 8990,
    period: "/мес",
    description: "Максимум возможностей",
    features: [
      "5 распаковок (проектов)",
      "Все 7 AI-агентов",
      "Telegram-трекер и мотивация",
      "Свободный чат с трекером",
      "Opus 4.6 для артефактов",
      "Приоритетная поддержка",
    ],
    popular: false,
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
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="cursor-pointer hidden sm:inline-flex">
                Тарифы
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                Войти
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="cursor-pointer">
                Создать аккаунт
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
            Целая команда AI-экспертов в твоём телефоне
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-up">
            Создай и запусти{" "}
            <span className="text-primary">онлайн-продукт</span>
            {" "}с AI за неделю
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            7 AI-агентов проведут тебя от распаковки экспертности до первых продаж.
            Методолог, маркетолог, продажник — вся команда работает на тебя 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/register">
              <Button size="xl" className="w-full sm:w-auto cursor-pointer">
                Начать сейчас
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="xl" variant="outline" className="w-full sm:w-auto cursor-pointer">
                Смотреть тарифы
              </Button>
            </Link>
          </div>
          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Безопасная оплата
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" />
              Веб + Telegram
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Результат за 7 дней
            </span>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="py-16 px-4 border-y bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-heading text-4xl font-bold text-primary mb-2">7</div>
              <p className="text-sm text-muted-foreground">
                AI-агентов работают<br />как целая команда
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">
                Доступ в любое время,<br />даже с телефона
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl font-bold text-primary mb-2">x50</div>
              <p className="text-sm text-muted-foreground">
                Дешевле живой команды<br />продюсера
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — 7 agents */}
      <section className="py-20 px-4" id="agents">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              7 шагов к готовому продукту
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Каждый агент решает одну задачу и передаёт результат следующему.
              Ты получаешь готовые документы на каждом этапе.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <div
                key={agent.title}
                className="group relative bg-card rounded-xl border p-6 hover:shadow-md transition-all duration-200"
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
                    <p className="text-sm text-muted-foreground mb-2">
                      {agent.description}
                    </p>
                    <Badge variant="secondary" className="text-[10px]">
                      {agent.output}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Для кого AIProducer?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {forWhom.map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-card rounded-xl border p-6">
                <Users className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Простые тарифы
            </h2>
            <p className="text-muted-foreground text-lg">
              Одна подписка — вся команда AI-агентов. Ежемесячное продление.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Популярный
                  </Badge>
                )}
                <h3 className="font-heading text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="font-heading text-4xl font-bold">
                    {plan.price.toLocaleString("ru-RU")}
                  </span>
                  <span className="text-muted-foreground"> ₽{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className="w-full cursor-pointer"
                  >
                    Выбрать {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Не откладывай запуск продукта
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Пока ты думаешь, другие эксперты уже упаковывают свои знания с AI.
            Начни сегодня — первые результаты увидишь через 30 минут.
          </p>
          <Link href="/register">
            <Button size="xl" className="cursor-pointer">
              Создать аккаунт
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-heading text-sm font-semibold">AIProducer</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/legal/offer" className="hover:text-foreground transition-colors">
                Оферта
              </Link>
              <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                Конфиденциальность
              </Link>
              <span>support@aiproducer.ru</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AIProducer. ИП.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
