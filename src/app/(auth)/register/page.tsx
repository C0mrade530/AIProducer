"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const STEPS_PREVIEW = [
  "AI раскроет твою экспертность",
  "Создаст структуру продукта",
  "Сгенерирует контент-план и воронки",
]

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Введи своё имя"); return }
    if (password.length < 6) { setError("Пароль должен быть не менее 6 символов"); return }
    setLoading(true)
    setError("")

    const supabase = createClient()

    // 1. Register
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Этот email уже зарегистрирован. Попробуй войти.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    const user = authData.user
    if (!user) { setError("Ошибка регистрации. Попробуй ещё раз."); setLoading(false); return }

    // 2. Setup everything in one go: profile, workspace, project, subscription
    const { error: profileError } = await supabase.from("profiles").update({
      name: name.trim(),
      onboarding_completed: true,
    }).eq("id", user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      setError("Ошибка сохранения профиля. Попробуй ещё раз.")
      setLoading(false)
      return
    }

    const { data: workspace, error: wsError } = await supabase.from("workspaces").insert({
      owner_id: user.id,
      title: name.trim(),
      niche: "",
    }).select("id").single()

    if (wsError || !workspace) {
      // Workspace already exists — just go to agent
      window.location.href = "/agent/unpacker?welcome=1"
      return
    }

    // Create membership, project, subscription in parallel
    await Promise.all([
      supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      }),
      supabase.from("projects").insert({
        workspace_id: workspace.id,
        name: "Мой первый продукт",
      }),
      supabase.from("subscriptions").insert({
        workspace_id: workspace.id,
        plan: "starter",
        status: "active",
      }),
    ])

    // Go straight to first agent
    window.location.href = "/agent/unpacker?welcome=1"
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
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Создай свой продукт с AI</CardTitle>
            <CardDescription className="text-base">
              Зарегистрируйся и начни работу за 30 секунд
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Твоё имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  autoComplete="given-name"
                  className="h-12 text-base"
                />
                <p className="text-[11px] text-muted-foreground mt-1 ml-1">
                  Так к тебе будут обращаться AI-агенты
                </p>
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 text-base"
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
                  className="h-12 text-base"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full h-12 text-base" loading={loading}>
                Начать бесплатно
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>

            {/* What you'll get */}
            <div className="mt-6 pt-5 border-t space-y-2.5">
              {STEPS_PREVIEW.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-primary hover:underline cursor-pointer">
                Войти
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
