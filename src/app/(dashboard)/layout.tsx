"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<{ name: string; niche: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadData()

    // FIX #5: Listen for custom event to refresh sidebar after artifact save
    const handleStepUpdate = () => loadData()
    window.addEventListener("aiproducer:step-updated", handleStepUpdate)
    return () => window.removeEventListener("aiproducer:step-updated", handleStepUpdate)
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, niche, onboarding_completed")
      .eq("id", user.id)
      .single()

    if (!profileData?.onboarding_completed) {
      // Don't redirect if already on onboarding
      if (!window.location.pathname.includes("/onboarding")) {
        router.push("/onboarding")
        return
      }
    }

    setProfile(profileData ? { name: profileData.name || "", niche: profileData.niche || "" } : null)

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (workspace) {
      const { data: project } = await supabase
        .from("projects")
        .select("current_step")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (project) setCurrentStep(project.current_step || 1)
    }

    setReady(true)
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        profile={profile}
        currentStep={currentStep}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
