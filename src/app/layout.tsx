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
  title: "GetProdi — Твой AI-продюсер",
  description:
    "Начни зарабатывать на блоге без продюсера. 7 AI-агентов с экспертизой лучших продюсеров мира: позиционирование, продукт, контент, воронка и продажи.",
  openGraph: {
    title: "GetProdi — Начни зарабатывать на блоге без продюсера",
    description: "7 AI-агентов заменят продюсера за 300к. Позиционирование, продукт, Reels, воронка и скрипты продаж — всё в одном месте.",
    siteName: "GetProdi",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
