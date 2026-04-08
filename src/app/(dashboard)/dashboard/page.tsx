"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/agents/constants"
import { StepCard } from "@/components/dashboard/step-card"
import { OnboardingTour } from "@/components/dashboard/onboarding-tour"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, ArrowRight, Plus, ChevronDown, Pencil, Check, FolderOpen } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<{ name: string; niche: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(true)

  // Project management
  const [projects, setProjects] = useState<Array<{ id: string; name: string; current_step: number }>>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [maxProjects, setMaxProjects] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    // Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, niche, onboarding_completed")
      .eq("id", user.id)
      .single()

    if (!profileData?.onboarding_completed) { router.push("/onboarding"); return }
    setProfile(profileData)

    // Workspace + project
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!workspace) { router.push("/onboarding"); return }

    // Check subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("workspace_id", workspace.id)
      .eq("status", "active")
      .single()

    if (!subscription) {
      setHasSubscription(false)
    }

    // Load projects via API
    try {
      const projRes = await fetch("/api/projects")
      if (projRes.ok) {
        const projData = await projRes.json()
        setProjects(projData.projects || [])
        setMaxProjects(projData.maxProjects || 1)

        // Pick active project: localStorage → first in list
        const storedId = typeof window !== "undefined" ? localStorage.getItem("getprodi:active-project-id") : null
        const active =
          projData.projects?.find((p: { id: string }) => p.id === storedId) ||
          projData.projects?.[0]

        if (active) {
          setActiveProjectId(active.id)
          if (typeof window !== "undefined") {
            localStorage.setItem("getprodi:active-project-id", active.id)
          }
          await loadProjectData(supabase, active.id, active.current_step)
        }
      }
    } catch {
      // Fallback: load directly
      const { data: project } = await supabase
        .from("projects")
        .select("id, current_step")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (project) {
        setActiveProjectId(project.id)
        await loadProjectData(supabase, project.id, project.current_step)
      }
    }

    setLoading(false)

    // Show tour if ?tour=1 in URL
    if (searchParams.get("tour") === "1") {
      setShowTour(true)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadProjectData = async (supabase: any, projectId: string, step: number) => {
    setCurrentStep(step || 1)

    const { data: artifacts } = await supabase
      .from("artifacts")
      .select("agent_id")
      .eq("project_id", projectId)

    const { data: agentDefs } = await supabase
      .from("agent_definitions")
      .select("id, code")

    const idToCode = new Map(agentDefs?.map((d: { id: string; code: string }) => [d.id, d.code]) || [])
    const completed = new Set(
      artifacts?.map((a: { agent_id: string }) => idToCode.get(a.agent_id)).filter(Boolean) as string[] || []
    )
    setCompletedAgents(completed)
  }

  const switchProject = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    setActiveProjectId(projectId)
    setShowProjectMenu(false)
    if (typeof window !== "undefined") {
      localStorage.setItem("getprodi:active-project-id", projectId)
    }
    const supabase = createClient()
    await loadProjectData(supabase, projectId, project.current_step)
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return
    setCreatingProject(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      })
      if (res.ok) {
        const { project } = await res.json()
        setProjects((prev) => [project, ...prev])
        setActiveProjectId(project.id)
        setCurrentStep(1)
        setCompletedAgents(new Set())
        setNewProjectName("")
        setShowProjectMenu(false)
      } else if (res.status === 429) {
        // Limit reached — don't close menu, show will be handled by upsell
        alert("Лимит проектов исчерпан. Перейдите на более высокий тариф.")
      }
    } catch (err) {
      console.error("Create project error:", err)
    } finally {
      setCreatingProject(false)
    }
  }

  const renameProject = async (projectId: string) => {
    if (!renameValue.trim()) return
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name: renameValue.trim() }),
      })
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, name: renameValue.trim() } : p))
        )
        setRenamingProjectId(null)
      }
    } catch (err) {
      console.error("Rename project error:", err)
    }
  }

  const handleTourComplete = () => {
    setShowTour(false)
    // Remove ?tour=1 from URL
    router.replace("/dashboard")
  }

  const completedCount = completedAgents.size
  const progress = Math.round((completedCount / 7) * 100)

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="h-8 w-48 glass border border-gray-800/40 rounded-xl animate-pulse mb-4" />
        <div className="h-4 w-64 glass border border-gray-800/40 rounded-xl animate-pulse mb-10" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 glass border border-gray-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
    {showTour && <OnboardingTour onComplete={handleTourComplete} />}
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          Привет, {profile?.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Твой прогресс: {completedCount} из 7 шагов
        </p>
      </div>

      {/* Project selector */}
      {projects.length > 0 && (
        <div className="mb-6 relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 glass border border-gray-800/60 rounded-xl px-4 py-2.5 hover:border-gray-700/60 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <FolderOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium truncate">
              {projects.find((p) => p.id === activeProjectId)?.name || "Проект"}
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", showProjectMenu && "rotate-180")} />
            {projects.length > 1 && (
              <span className="text-[10px] text-muted-foreground ml-1">
                {projects.length}/{maxProjects}
              </span>
            )}
          </button>

          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)} />
              <div className="absolute left-0 top-full mt-2 w-80 glass border border-gray-800/60 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-up">
                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center gap-2">
                      {renamingProjectId === project.id ? (
                        <div className="flex-1 flex items-center gap-1.5 px-2">
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && renameProject(project.id)}
                          />
                          <button
                            onClick={() => renameProject(project.id)}
                            className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted cursor-pointer shrink-0"
                          >
                            <Check className="h-3.5 w-3.5 text-success" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => switchProject(project.id)}
                            className={cn(
                              "flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer truncate",
                              project.id === activeProjectId
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50"
                            )}
                          >
                            {project.name}
                            <span className="text-[10px] text-muted-foreground ml-2">
                              шаг {project.current_step}/7
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setRenamingProjectId(project.id)
                              setRenameValue(project.name)
                            }}
                            className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted cursor-pointer shrink-0"
                            title="Переименовать"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {projects.length < maxProjects && (
                  <div className="border-t border-gray-800/40 p-2">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Новый проект..."
                        className="h-8 text-sm flex-1"
                        onKeyDown={(e) => e.key === "Enter" && createProject()}
                      />
                      <Button
                        size="sm"
                        onClick={createProject}
                        disabled={!newProjectName.trim() || creatingProject}
                        className="h-8 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {projects.length >= maxProjects && (
                  <div className="border-t border-gray-800/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Лимит проектов: {projects.length}/{maxProjects}
                    </p>
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                        Увеличить лимит
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(262 85% 62%), hsl(220 80% 58%))",
              boxShadow: "0 0 12px hsl(262 85% 62% / 0.4), 0 0 24px hsl(262 85% 62% / 0.2)",
            }}
          />
        </div>
      </div>

      {!hasSubscription && (
        <div className="mb-8 glass border border-primary/20 glow-border rounded-2xl p-8 text-center animate-fade-up">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">
            Начни с бесплатной распаковки
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Первый агент «Распаковщик» доступен бесплатно. Попробуй и убедись в качестве, а затем открой все 7 агентов.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/agent/unpacker">
              <Button size="lg" variant="accent" className="cursor-pointer shadow-lg shadow-accent/20">
                Начать распаковку бесплатно
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="cursor-pointer">
                Все тарифы
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {AGENTS.map((agent) => {
          const isCompleted = completedAgents.has(agent.code)
          const isCurrent = agent.step === currentStep
          const isLocked = agent.step > currentStep + 1

          return (
            <StepCard
              key={agent.code}
              agent={agent}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
            />
          )
        })}
      </div>
    </div>
    </>
  )
}
