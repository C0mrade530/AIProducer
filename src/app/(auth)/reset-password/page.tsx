"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      return
    }
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError("Не удалось сменить пароль. Попробуйте запросить ссылку заново.")
    } else {
      router.push("/dashboard")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#050510" }}>
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px]" />

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
            <h1 className="font-heading text-xl font-bold text-white mb-1">Новый пароль</h1>
            <p className="text-sm text-gray-400">Введи новый пароль для аккаунта</p>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="password"
              placeholder="Новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              minLength={6}
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
            />
            <Input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full rounded-xl" size="lg" loading={loading}>
              Сохранить пароль
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
