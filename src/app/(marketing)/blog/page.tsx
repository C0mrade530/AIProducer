import { ProdiLogo } from "@/components/brand/prodi-logo"
import { ArrowLeft, ArrowRight, Sparkles, Target, TrendingUp, Zap, Bot, DollarSign } from "lucide-react"
import Link from "next/link"

const articles = [
  {
    slug: "why-experts-fail",
    title: "Почему 90% экспертов не зарабатывают на своих знаниях",
    excerpt: "Разбираем главные ошибки экспертов, которые мешают монетизировать опыт. Отсутствие системы, хаотичный контент и страх продаж — как с этим справиться.",
    date: "3 апреля 2026",
    category: "Стратегия",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    featured: true,
  },
  {
    slug: "reels-that-sell",
    title: "Reels, которые продают: 5 формул для экспертов",
    excerpt: "Как создавать Reels, которые не просто набирают охваты, а приводят клиентов. Проверенные формулы hooks и структуры.",
    date: "2 апреля 2026",
    category: "Контент",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    featured: false,
  },
  {
    slug: "ai-vs-producer",
    title: "AI-продюсер vs живой продюсер: что выбрать в 2026",
    excerpt: "Сравниваем стоимость, скорость и качество работы AI-агентов с командой из продюсера, методолога и маркетолога.",
    date: "1 апреля 2026",
    category: "Продукт",
    icon: Bot,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    featured: false,
  },
  {
    slug: "first-online-product",
    title: "Как создать первый онлайн-продукт за 7 дней",
    excerpt: "Пошаговый гайд: от идеи до готового продукта с тарифами. Без опыта в инфобизнесе, без команды, с помощью AI.",
    date: "30 марта 2026",
    category: "Гайд",
    icon: Sparkles,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    featured: false,
  },
  {
    slug: "sales-scripts-guide",
    title: "Скрипты продаж для экспертов: как закрывать в оплату",
    excerpt: "Готовые скрипты для переписки в Direct, созвонов и дожима. Как продавать уверенно без ощущения навязчивости.",
    date: "28 марта 2026",
    category: "Продажи",
    icon: DollarSign,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    featured: false,
  },
]

export default function BlogPage() {
  const featured = articles.find((a) => a.featured)!
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="min-h-screen text-white" style={{ background: "#000000" }}>
      {/* Nav */}
      <nav
        className="border-b border-gray-800/60"
        style={{ background: "rgba(5, 5, 16, 0.8)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <ProdiLogo size={32} />
            <span className="font-heading text-lg font-bold text-white">GetProdi</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              На главную
            </Link>
          </div>
        </div>
      </nav>

      {/* Ambient glow */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-violet-600/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-80 right-1/4 w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">Блог</h1>
          <p className="text-gray-400 text-lg">Статьи о блогинге, продажах и AI для экспертов</p>
        </div>

        {/* Featured article */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">Featured</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-white leading-tight">
                {featured.title}
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-gray-500">{featured.date}</span>
                <span className="text-xs text-gray-600">&bull;</span>
                <span className="text-xs text-gray-500">{featured.category}</span>
              </div>
              <Link
                href={`/blog/${featured.slug}`}
                className="inline-flex items-center gap-2 text-sm text-white bg-white/5 hover:bg-white/10 border border-gray-700/60 hover:border-gray-600 rounded-xl px-5 py-2.5 transition-all cursor-pointer"
              >
                Читать статью
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="glass rounded-2xl border border-gray-800/60 aspect-[16/10] flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-[60px] bg-blue-500/15 animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full blur-[50px] bg-violet-500/15 animate-pulse" style={{ animationDelay: "1.5s" }} />
              <div className={`${featured.bg} border ${featured.color.replace("text-", "border-").replace("400", "500/20")} rounded-2xl p-6`}>
                <featured.icon className={`h-16 w-16 ${featured.color}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="accent-line mb-12" />

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-800/40 pb-4">
          <button className="text-sm font-medium text-white border-b-2 border-violet-500 pb-1 cursor-pointer">Все</button>
          <button className="text-sm text-gray-500 hover:text-gray-300 pb-1 cursor-pointer transition-colors">Стратегия</button>
          <button className="text-sm text-gray-500 hover:text-gray-300 pb-1 cursor-pointer transition-colors">Контент</button>
          <button className="text-sm text-gray-500 hover:text-gray-300 pb-1 cursor-pointer transition-colors">Продукт</button>
          <button className="text-sm text-gray-500 hover:text-gray-300 pb-1 cursor-pointer transition-colors">Продажи</button>
        </div>

        {/* Articles grid */}
        <div className="space-y-6">
          {rest.map((article) => (
            <div
              key={article.slug}
              className="group grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center glass rounded-xl border border-gray-800/40 hover:border-gray-700/60 p-6 transition-all cursor-pointer"
            >
              <div>
                <h3 className="font-heading text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{article.excerpt}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{article.date}</span>
                  <span className="text-xs text-gray-600">&bull;</span>
                  <span className="text-xs text-gray-500">{article.category}</span>
                </div>
              </div>
              <div className="hidden sm:flex">
                <div className={`${article.bg} border border-gray-800/40 rounded-xl p-4`}>
                  <article.icon className={`h-10 w-10 ${article.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-8 px-4 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ProdiLogo size={28} />
            <span className="font-heading text-sm font-semibold text-white">GetProdi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Оферта</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Конфиденциальность</Link>
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} GetProdi</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
