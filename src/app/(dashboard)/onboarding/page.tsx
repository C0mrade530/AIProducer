"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react"

const steps = [
  { title: "Как тебя зовут?", subtitle: "Имя будет видно только тебе" },
  { title: "Какая у тебя ниша?", subtitle: "Например: психология, фитнес, маркетинг, финансы" },
  { title: "Расскажи о своей экспертизе", subtitle: "Чем ты занимаешься и кому помогаешь?" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ name: "", niche: "", bio: "" })

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const canProceed = () => {
    if (step === 0) return data.name.trim().length > 0
    if (step === 1) return data.niche.trim().length > 0
    if (step === 2) return data.bio.trim().length > 10
    return false
  }

  const handleComplete = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update profile
    await supabase.from("profiles").update({
      name: data.name,
      niche: data.niche,
      bio: data.bio,
      onboarding_completed: true,
    }).eq("id", user.id)

    // Create workspace
    const { data: workspace } = await supabase.from("workspaces").insert({
      owner_id: user.id,
      title: `${data.name} — ${data.niche}`,
      niche: data.niche,
      description: data.bio,
    }).select().single()

    if (workspace) {
      // Add owner as member
      await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
      })

      // Create first project
      await supabase.from("projects").insert({
        workspace_id: workspace.id,
        name: "Мой первый продукт",
        onboarding_data: data,
      })

      // Create starter subscription
      await supabase.from("subscriptions").insert({
        workspace_id: workspace.id,
        plan: "starter",
        status: "active",
      })
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold">AIProducer</span>
        </div>

        {/* Step content */}
        <div className="animate-fade-up" key={step}>
          <h1 className="font-heading text-3xl font-bold mb-2">
            {steps[step].title}
          </h1>
          <p className="text-muted-foreground mb-8">
            {steps[step].subtitle}
          </p>

          {step === 0 && (
            <Input
              placeholder="Введи своё имя"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoFocus
              className="text-lg h-14"
            />
          )}

          {step === 1 && (
            <Input
              placeholder="Например: нутрициология"
              value={data.niche}
              onChange={(e) => setData({ ...data, niche: e.target.value })}
              autoFocus
              className="text-lg h-14"
            />
          )}

          {step === 2 && (
            <Textarea
              placeholder="Расскажи кратко: чем занимаешься, какой опыт, кому помогаешь..."
              value={data.bio}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
              autoFocus
              className="text-lg min-h-[160px]"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>

          {step < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="cursor-pointer"
            >
              Далее
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              loading={loading}
              variant="accent"
              className="cursor-pointer"
            >
              Начать работу
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
