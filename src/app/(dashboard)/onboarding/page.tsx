"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import { ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
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
        await supabase.from("profiles").update({ name: name.trim(), onboarding_completed: true }).eq("id", user.id)
        window.location.href = "/pricing?onboarding=1"
        return
      }

      // Create workspace — INSERT then SELECT separately to avoid RLS issue
      const { error: wsError } = await supabase
        .from("workspaces")
        .insert({ owner_id: user.id, title: name.trim(), niche: "" })

      if (wsError) throw new Error(wsError.message)

      // Now SELECT it back (RLS allows owner to SELECT)
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .single()

      if (!workspace) throw new Error("Workspace не найден после создания")

      // Create related records (NO subscription — user must pay first)
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

      // Mark onboarding complete LAST
      await supabase.from("profiles").update({
        name: name.trim(),
        onboarding_completed: true,
      }).eq("id", user.id)

      // Process referral if user was referred
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
        // Non-critical — referral can fail silently
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
    if (e.key === "Enter" && name.trim()) handleComplete()
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
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <Button
            onClick={handleComplete}
            disabled={!name.trim() || loading}
            loading={loading}
            size="xl"
            className="w-full cursor-pointer rounded-xl"
          >
            Начать
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
