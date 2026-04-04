import type { Metadata } from "next"
import { DM_Sans, Space_Grotesk } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://getprodi.ru"),
  title: {
    default: "GetProdi — AI-продюсер для экспертов",
    template: "%s | GetProdi",
  },
  description:
    "Начни зарабатывать на блоге без продюсера. 7 AI-агентов создадут продукт, контент-план, воронку и скрипты продаж — за дни, а не месяцы.",
  keywords: [
    "AI продюсер", "заработок на блоге", "онлайн продукт", "контент план",
    "сценарии для Reels", "воронка продаж", "скрипты продаж", "распаковка экспертности",
    "GetProdi", "AI агенты", "блогинг", "монетизация знаний",
  ],
  authors: [{ name: "GetProdi" }],
  creator: "GetProdi",
  verification: {
    yandex: "f7f8286786a36e2e",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://getprodi.ru",
    siteName: "GetProdi",
    title: "GetProdi — AI-продюсер для экспертов",
    description: "7 AI-агентов заменят продюсера за 300к. Позиционирование, продукт, Reels, воронка и скрипты продаж — всё в одном месте.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "GetProdi — AI-продюсер для экспертов" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetProdi — AI-продюсер для экспертов",
    description: "Упакуй знания в продукт и начни зарабатывать на блоге. 7 AI-агентов вместо команды за 300к.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://getprodi.ru",
  },
}

// JSON-LD structured data — hardcoded static content, safe for inline script
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GetProdi",
  description: "AI-продюсер для экспертов и блогеров. 7 AI-агентов создадут продукт, контент-план, воронку и скрипты продаж.",
  url: "https://getprodi.ru",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "AggregateOffer", lowPrice: "2990", highPrice: "8990", priceCurrency: "RUB", offerCount: 3 },
  creator: { "@type": "Organization", name: "GetProdi", url: "https://getprodi.ru" },
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </head>
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
