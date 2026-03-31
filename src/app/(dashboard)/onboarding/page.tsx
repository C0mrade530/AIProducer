"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(true)
  const submittedRef = useRef(false) // FIX #2: prevent double submit

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
      // Check if workspace exists too
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .single()

      if (workspace) {
        router.push("/dashboard")
        return
      }
      // Profile says done but no workspace — reset and let them redo
      await supabase.from("profiles").update({ onboarding_completed: false }).eq("id", user.id)
    }
    setChecking(false)
  }

  const handleComplete = async () => {
    if (!name.trim() || submittedRef.current) return
    submittedRef.current = true // FIX #2: block double submit
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Сессия истекла. Войдите заново."); setLoading(false); submittedRef.current = false; return }

    // FIX #2: Check if workspace already exists
    const { data: existingWs } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .single()

    if (existingWs) {
      // Already has workspace — just mark onboarding done and go
      await supabase.from("profiles").update({ name: name.trim(), onboarding_completed: true }).eq("id", user.id)
      window.location.href = "/dashboard?tour=1"
      return
    }

    // Step 1: Create workspace first (before marking onboarding complete)
    const { data: workspace, error: wsError } = await supabase.from("workspaces").insert({
      owner_id: user.id,
      title: name.trim(),
      niche: "",
    }).select("id").single()

    if (wsError || !workspace) {
      console.error("Workspace error:", wsError)
      setError("Ошибка создания. Попробуйте ещё раз.")
      setLoading(false)
      submittedRef.current = false
      return
    }

    // Step 2: Create member, project, subscription
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

    // Step 3: Only NOW mark onboarding complete (after workspace exists)
    await supabase.from("profiles").update({
      name: name.trim(),
      onboarding_completed: true,
    }).eq("id", user.id)

    window.location.href = "/dashboard?tour=1"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) handleComplete()
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-up text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-heading text-2xl font-bold">AIProducer</span>
        </div>

        <h1 className="font-heading text-4xl font-bold mb-3">
          Как тебя зовут?
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Так к тебе будут обращаться AI-агенты
        </p>

        <div className="max-w-sm mx-auto">
          <Input
            placeholder="Введи своё имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-center text-lg h-14 mb-4"
          />
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <Button
            onClick={handleComplete}
            disabled={!name.trim() || loading}
            loading={loading}
            size="xl"
            className="w-full cursor-pointer"
          >
            Начать
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
