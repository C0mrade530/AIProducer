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
  title: "GetProdi — Упакуй знания в бизнес",
  description:
    "AI-продюсер для экспертов и блогеров. 7 AI-агентов упакуют тебя с нуля: позиционирование, продукт, контент-план, сценарии Reels, воронка и скрипты продаж.",
  openGraph: {
    title: "GetProdi — Упакуй знания в бизнес",
    description: "Есть экспертность, но нет блога и продукта? 7 AI-агентов соберут всё за тебя — от позиционирования до первых продаж.",
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
