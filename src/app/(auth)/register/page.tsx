"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

    // FIX #1: Check if session exists (email confirmation may be required)
    if (!data.session) {
      setError("Подтвердите email по ссылке в письме, затем войдите.")
      setLoading(false)
      return
    }

    // Session exists — go to onboarding
    // Referral code is stored in user_metadata and processed during onboarding
    window.location.href = "/onboarding"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <ProdiLogo size={40} />
            <span className="font-heading text-2xl font-bold">GetProdi</span>
          </Link>
        </div>

        {refCode && (
          <div className="mb-4 text-center text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
            Вы регистрируетесь по приглашению
          </div>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Создать аккаунт</CardTitle>
            <CardDescription>
              Начни создавать свой онлайн-продукт с AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Пароль (минимум 6 символов)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Зарегистрироваться
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Регистрируясь, вы принимаете{" "}
                <Link href="/terms" className="text-primary hover:underline cursor-pointer">оферту</Link>
                {" "}и{" "}
                <Link href="/privacy" className="text-primary hover:underline cursor-pointer">политику конфиденциальности</Link>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-primary hover:underline cursor-pointer">
                  Войти
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
