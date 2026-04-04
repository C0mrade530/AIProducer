"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes("Invalid login")) {
        setError("Неверный email или пароль")
      } else {
        setError(error.message)
      }
    } else {
      window.location.href = "/dashboard"
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#000000" }}>
      {/* Background effects */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-fade-up relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <ProdiLogo size={40} />
            <span className="font-heading text-2xl font-bold text-white">GetProdi</span>
          </Link>
        </div>

        <div
          className="rounded-2xl border border-gray-800/60 p-6 sm:p-8"
          style={{ background: "rgba(15, 15, 30, 0.7)", backdropFilter: "blur(16px)" }}
        >
          <div className="text-center mb-6">
            <h1 className="font-heading text-xl font-bold text-white mb-1">Войти в аккаунт</h1>
            <p className="text-sm text-gray-400">Введи email и пароль</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full rounded-xl" size="lg" loading={loading}>
              Войти
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300 cursor-pointer">
                Забыли пароль?
              </Link>
              <Link href="/register" className="text-violet-400 hover:text-violet-300 cursor-pointer">
                Регистрация
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
