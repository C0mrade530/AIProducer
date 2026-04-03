"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
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
    window.location.href = "/onboarding"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold">AIProducer</span>
          </Link>
        </div>

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
