"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import { ArrowRight } from "lucide-react"

const NICHES = [
  "Коучинг и консалтинг",
  "Психология и терапия",
  "Фитнес и здоровье",
  "Маркетинг и SMM",
  "Образование и репетиторство",
  "Бизнес и предпринимательство",
  "Дизайн и креатив",
  "IT и программирование",
  "Финансы и инвестиции",
  "Другое",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 = name, 2 = niche
  const [name, setName] = useState("")
  const [niche, setNiche] = useState("")
  const [customNiche, setCustomNiche] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(true)
  const submittedRef = useRef(false)

  useEffect(() => {
    checkOnboarding()
  }, [])

  const checkOnboarding = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()

    if (profile?.onboarding_completed) {
      router.push("/dashboard")
      return
    }
    setChecking(false)
  }

  const goToStep2 = () => {
    if (!name.trim()) return
    setStep(2)
  }

  const finalNiche = niche === "Другое" ? customNiche.trim() : niche

  const handleComplete = async () => {
    if (!name.trim() || submittedRef.current) return
    submittedRef.current = true
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { throw new Error("Сессия истекла") }

      // Check existing workspace
      const { data: existingWs } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (existingWs) {
        await supabase.from("profiles").update({
          name: name.trim(),
          niche: finalNiche,
          onboarding_completed: true,
        }).eq("id", user.id)
        // Update workspace niche too
        await supabase.from("workspaces").update({ niche: finalNiche }).eq("id", existingWs.id)
        window.location.href = "/pricing?onboarding=1"
        return
      }

      // Create workspace
      const { error: wsError } = await supabase
        .from("workspaces")
        .insert({ owner_id: user.id, title: name.trim(), niche: finalNiche })

      if (wsError) throw new Error(wsError.message)

      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .single()

      if (!workspace) throw new Error("Workspace не найден после создания")

      const [membersRes, projectsRes] = await Promise.all([
        supabase.from("workspace_members").insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        }),
        supabase.from("projects").insert({
          workspace_id: workspace.id,
          name: "Мой первый продукт",
        }),
      ])

      if (membersRes.error) console.error("members:", membersRes.error)
      if (projectsRes.error) console.error("projects:", projectsRes.error)

      await supabase.from("profiles").update({
        name: name.trim(),
        niche: finalNiche,
        email: user.email,
        onboarding_completed: true,
      }).eq("id", user.id)

      // Process referral
      try {
        const refCode = user.user_metadata?.referral_code
        if (refCode) {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", refCode)
            .single()

          if (referrer && referrer.id !== user.id) {
            await supabase.from("referrals").insert({
              referrer_id: referrer.id,
              referred_id: user.id,
              status: "registered",
            })
            await supabase.from("profiles").update({ referred_by: referrer.id }).eq("id", user.id)
          }
        }
      } catch {
        // Non-critical
      }

      window.location.href = "/pricing?onboarding=1"
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка"
      console.error("Onboarding error:", message)
      setError(message)
      submittedRef.current = false
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      if (step === 1) goToStep2()
      else handleComplete()
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#000000" }}>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="w-full max-w-lg text-center relative z-10 animate-pulse">
          <div className="inline-flex items-center gap-2.5 mb-8">
            <ProdiLogo size={48} />
            <span className="font-heading text-2xl font-bold text-white">GetProdi</span>
          </div>
          <div className="h-10 w-64 mx-auto glass border border-gray-800/40 rounded-xl mb-4" />
          <div className="h-5 w-48 mx-auto glass border border-gray-800/40 rounded-lg mb-8" />
          <div className="max-w-sm mx-auto">
            <div className="h-14 glass border border-gray-800/40 rounded-xl mb-4" />
            <div className="h-14 glass border border-gray-800/40 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#000000" }}>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg animate-fade-up text-center relative z-10">
        <div className="inline-flex items-center gap-2.5 mb-8">
          <ProdiLogo size={48} />
          <span className="font-heading text-2xl font-bold text-white">GetProdi</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? "bg-violet-500" : "bg-gray-700"}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? "bg-violet-500" : "bg-gray-700"}`} />
        </div>

        {step === 1 ? (
          <>
            <h1 className="font-heading text-4xl font-bold mb-3 text-white">
              Как тебя зовут?
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Так к тебе будут обращаться AI-агенты
            </p>

            <div className="max-w-sm mx-auto">
              <Input
                placeholder="Введи своё имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-center text-lg h-14 mb-4 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={goToStep2}
                disabled={!name.trim()}
                size="xl"
                className="w-full cursor-pointer rounded-xl"
              >
                Далее
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-heading text-4xl font-bold mb-3 text-white">
              Твоя ниша
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Это поможет агентам лучше понять тебя
            </p>

            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {NICHES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNiche(n)}
                    className={`px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer border ${
                      niche === n
                        ? "bg-violet-500/20 border-violet-500/50 text-white"
                        : "bg-gray-900/50 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {niche === "Другое" && (
                <Input
                  placeholder="Укажи свою нишу"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="text-center text-lg h-14 mb-4 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500"
                />
              )}

              {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  size="xl"
                  className="cursor-pointer rounded-xl"
                >
                  Назад
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  loading={loading}
                  size="xl"
                  className="flex-1 cursor-pointer rounded-xl"
                >
                  Начать
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              <button
                onClick={handleComplete}
                disabled={loading}
                className="text-xs text-gray-600 hover:text-gray-400 mt-3 cursor-pointer transition-colors"
              >
                Пропустить этот шаг
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
