"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    // FIX #3: Route through callback with ?next=/reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError("Не удалось отправить ссылку. Проверьте email.")
    } else {
      setSent(true)
    }
    setLoading(false)
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

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Восстановить пароль</CardTitle>
            <CardDescription>
              Введи email — мы отправим ссылку для сброса пароля
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="font-medium text-lg">Ссылка отправлена!</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Проверь почту <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Отправить ссылку
                </Button>
              </form>
            )}
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary cursor-pointer inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад к входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
