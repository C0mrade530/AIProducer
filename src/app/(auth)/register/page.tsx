"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: { name },
      },
    })

    if (error) {
      setError("Не удалось отправить ссылку. Попробуйте ещё раз.")
    } else {
      setSent(true)
    }
    setLoading(false)
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
              Начните создавать свой онлайн-продукт с AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <ArrowRight className="h-8 w-8 text-success" />
                </div>
                <div>
                  <p className="font-medium text-lg">Ссылка отправлена!</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Проверьте почту <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Зарегистрироваться
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Уже есть аккаунт?{" "}
                  <Link href="/login" className="text-primary hover:underline cursor-pointer">
                    Войти
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
