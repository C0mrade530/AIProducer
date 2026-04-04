"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import Link from "next/link"
import { Suspense } from "react"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref") || ""
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      return
    }
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          referral_code: refCode || undefined,
        },
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Этот email уже зарегистрирован. Попробуйте войти.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (!data.session) {
      setError("Подтвердите email по ссылке в письме, затем войдите.")
      setLoading(false)
      return
    }

    window.location.href = "/onboarding"
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#000000" }}>
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-fade-up relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <ProdiLogo size={40} />
            <span className="font-heading text-2xl font-bold text-white">GetProdi</span>
          </Link>
        </div>

        {refCode && (
          <div className="mb-4 text-center text-sm text-violet-300 bg-violet-600/10 border border-violet-500/20 rounded-xl px-4 py-2">
            Вы регистрируетесь по приглашению
          </div>
        )}

        <div
          className="rounded-2xl border border-gray-800/60 p-6 sm:p-8"
          style={{ background: "rgba(15, 15, 30, 0.7)", backdropFilter: "blur(16px)" }}
        >
          <div className="text-center mb-6">
            <h1 className="font-heading text-xl font-bold text-white mb-1">Создать аккаунт</h1>
            <p className="text-sm text-gray-400">Запусти своего AI-продюсера</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
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
              placeholder="Пароль (минимум 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full rounded-xl" size="lg" loading={loading}>
              Зарегистрироваться
            </Button>
            <p className="text-center text-xs text-gray-500">
              Регистрируясь, вы принимаете{" "}
              <Link href="/terms" className="text-violet-400 hover:underline cursor-pointer">оферту</Link>
              {" "}и{" "}
              <Link href="/privacy" className="text-violet-400 hover:underline cursor-pointer">политику конфиденциальности</Link>
            </p>
            <p className="text-center text-sm text-gray-400">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 cursor-pointer">
                Войти
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#000000" }}><div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
