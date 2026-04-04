"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Lock } from "lucide-react"
import type { AgentConfig } from "@/lib/agents/constants"

interface StepCardProps {
  agent: AgentConfig
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
}

export function StepCard({ agent, isCompleted, isCurrent, isLocked }: StepCardProps) {
  const Icon = agent.icon

  return (
    <div
      className={cn(
        "group flex items-center gap-5 rounded-xl p-5 transition-all duration-200 glass border",
        isCompleted && "border-emerald-500/20",
        isCurrent && "border-primary/30 glow-border shadow-[0_0_20px_hsl(262_85%_62%/0.1)]",
        isLocked && "opacity-40",
        !isCompleted && !isCurrent && !isLocked && "border-gray-800/40 hover:border-gray-700/60"
      )}
    >
      {/* Step number + icon */}
      <div className="relative">
        <div
          className={cn(
            "h-14 w-14 rounded-xl flex items-center justify-center transition-all",
            isCompleted ? "bg-success/10" : agent.bgColor,
            isCurrent && "shadow-[0_0_16px_hsl(262_85%_62%/0.2)]"
          )}
        >
          {isCompleted ? (
            <Check className="h-6 w-6 text-success" />
          ) : isLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Icon className={cn("h-6 w-6", agent.color)} />
          )}
        </div>
        <span
          className={cn(
            "absolute -top-1 -left-1 h-5 w-5 rounded-full bg-[#0a0a1a] text-[10px] font-bold flex items-center justify-center border",
            isCurrent ? "border-primary text-primary" : "border-gray-700 text-gray-400"
          )}
        >
          {agent.step}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-lg">
          {agent.name}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {agent.description}
        </p>
      </div>

      {/* Action */}
      <div className="shrink-0">
        {isCompleted ? (
          <Link href={`/agent/${agent.code}`}>
            <Button variant="ghost" size="sm" className="cursor-pointer">
              Открыть
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : isCurrent ? (
          <Link href={`/agent/${agent.code}`}>
            <Button size="sm" className="cursor-pointer rounded-xl">
              Начать
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : !isLocked ? (
          <Link href={`/agent/${agent.code}`}>
            <Button variant="outline" size="sm" className="cursor-pointer rounded-xl">
              Перейти
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  )
}
