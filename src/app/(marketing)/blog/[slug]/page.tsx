import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import { articles, getArticleBySlug } from "@/lib/blog/articles"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return { title: "Статья не найдена" }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      locale: "ru_RU",
      siteName: "GetProdi",
    },
  }
}

/**
 * Schema.org Article structured data.
 * Content is hardcoded at build time (not user-supplied).
 */
function ArticleSchema({ article }: { article: { title: string; excerpt: string; date: string } }) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: { "@type": "Organization", name: "GetProdi" },
    publisher: {
      "@type": "Organization",
      name: "GetProdi",
      url: "https://getprodi.ru",
    },
  })

  return (
    // eslint-disable-next-line react/no-danger -- Schema.org JSON-LD from hardcoded build-time data
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
  )
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const Icon = article.icon

  // Find next article for "read next"
  const currentIndex = articles.findIndex((a) => a.slug === slug)
  const nextArticle = articles[(currentIndex + 1) % articles.length]

  // Simple markdown-to-elements rendering
  const sections = article.content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-heading text-2xl font-bold text-white mt-10 mb-4">
          {block.replace("## ", "")}
        </h2>
      )
    }
    if (block.startsWith("**") && block.endsWith("**")) {
      return (
        <p key={i} className="text-white font-semibold mb-3">
          {block.replace(/\*\*/g, "")}
        </p>
      )
    }
    if (block.startsWith("- ") || block.startsWith("1. ")) {
      const items = block.split("\n").map((line) => line.replace(/^[-\d]+[.)]\s*/, ""))
      return (
        <ul key={i} className="space-y-2 mb-4 ml-4">
          {items.map((item, j) => (
            <li key={j} className="text-gray-300 leading-relaxed flex gap-2">
              <span className="text-violet-400 mt-1.5 shrink-0">&#x2022;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    }
    if (block.startsWith("|")) {
      const rows = block.split("\n").filter((r) => !r.startsWith("|---"))
      return (
        <div key={i} className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <tbody>
            {rows.map((row, ri) => {
              const cells = row.split("|").filter(Boolean).map((c) => c.trim())
              const Tag = ri === 0 ? "th" : "td"
              return (
                <tr key={ri} className={ri === 0 ? "border-b border-gray-700" : "border-b border-gray-800/40"}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} className={`px-3 py-2 text-left ${ri === 0 ? "text-gray-400 font-medium" : "text-gray-300"}`}>
                      {cell}
                    </Tag>
                  ))}
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      )
    }
    // Regular paragraph with inline bold
    const parts = block.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="text-white">{part.replace(/\*\*/g, "")}</strong>
      }
      return part
    })
    return (
      <p key={i} className="text-gray-300 leading-relaxed mb-4">
        {parts}
      </p>
    )
  })

  return (
    <div className="min-h-screen text-white" style={{ background: "#000000" }}>
      {/* Nav */}
      <nav
        className="border-b border-gray-800/60 sticky top-0 z-50"
        style={{ background: "rgba(5, 5, 16, 0.9)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <ProdiLogo size={32} />
            <span className="font-heading text-lg font-bold text-white">GetProdi</span>
          </Link>
          <Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Все статьи
          </Link>
        </div>
      </nav>

      {/* Ambient glow */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`${article.bg} rounded-lg p-2`}>
            <Icon className={`h-5 w-5 ${article.color}`} />
          </div>
          <span className="text-xs text-gray-500">{article.date}</span>
          <span className="text-xs text-gray-600">&bull;</span>
          <span className="text-xs text-gray-500">{article.category}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
          {article.title}
        </h1>
        <p className="text-lg text-gray-400 mb-8 leading-relaxed">{article.excerpt}</p>

        {/* Gradient line */}
        <div className="h-0.5 bg-gradient-to-r from-violet-500 via-blue-500 to-transparent rounded mb-10" />

        {/* Content */}
        <div className="prose-dark">{sections}</div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-violet-500/20 p-8 text-center"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))" }}
        >
          <h3 className="font-heading text-2xl font-bold text-white mb-3">
            Попробуй бесплатно
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Первый агент «Распаковщик» доступен бесплатно. Узнай своё позиционирование за 15 минут.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/20"
          >
            Начать распаковку бесплатно
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Read next */}
        {nextArticle && nextArticle.slug !== article.slug && (
          <div className="mt-12 pt-8 border-t border-gray-800/40">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Читать далее</p>
            <Link
              href={`/blog/${nextArticle.slug}`}
              className="group flex items-center justify-between gap-4 glass rounded-xl border border-gray-800/40 hover:border-gray-700/60 p-5 transition-all"
            >
              <div>
                <h4 className="font-heading text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                  {nextArticle.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{nextArticle.category}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-8 px-4 mt-8">
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

      <ArticleSchema article={article} />
    </div>
  )
}
