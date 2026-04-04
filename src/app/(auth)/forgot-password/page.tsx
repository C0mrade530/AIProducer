"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#050510" }}>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]" />

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
            <h1 className="font-heading text-xl font-bold text-white mb-1">Восстановить пароль</h1>
            <p className="text-sm text-gray-400">Введи email — мы отправим ссылку для сброса</p>
          </div>
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-lg text-white">Ссылка отправлена!</p>
                <p className="text-gray-400 text-sm mt-1">
                  Проверь почту <span className="font-medium text-white">{email}</span>
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
                className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
              />
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <Button type="submit" className="w-full rounded-xl" size="lg" loading={loading}>
                Отправить ссылку
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-gray-400 hover:text-violet-400 cursor-pointer inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Назад к входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
