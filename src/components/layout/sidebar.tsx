"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/agents/constants"
import {
  Sparkles,
  LayoutDashboard,
  ListTodo,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  profile: { name: string; niche: string } | null
  workspaceId: string | undefined
  projectId: string | undefined
  currentStep: number
}

export function Sidebar({ profile, currentStep }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-heading text-lg font-bold">AIProducer</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 rounded-md hover:bg-sidebar-border/50 flex items-center justify-center cursor-pointer transition-colors"
          aria-label={collapsed ? "Развернуть" : "Свернуть"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Profile */}
      {!collapsed && profile && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-sm font-medium truncate">{profile.name}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.niche}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <NavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Обзор"
          active={pathname === "/dashboard"}
          collapsed={collapsed}
        />

        {/* Agents */}
        {!collapsed && (
          <p className="px-3 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Агенты
          </p>
        )}
        {AGENTS.map((agent) => {
          const isActive = pathname === `/agent/${agent.code}`
          // Tracker agent is always accessible (free chat)
          const isLocked = agent.code === "tracker" ? false : agent.step > currentStep + 1
          const isCompleted = agent.step < currentStep
          const isCurrent = agent.step === currentStep

          return (
            <NavItem
              key={agent.code}
              href={isLocked ? "#" : `/agent/${agent.code}`}
              icon={agent.icon}
              label={collapsed ? agent.shortName : agent.name}
              active={isActive}
              collapsed={collapsed}
              disabled={isLocked}
              badge={
                isCompleted
                  ? "done"
                  : isCurrent
                    ? "current"
                    : undefined
              }
              color={agent.color}
            />
          )
        })}

        {/* Tasks */}
        {!collapsed && (
          <p className="px-3 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Инструменты
          </p>
        )}
        <NavItem
          href="/tasks"
          icon={ListTodo}
          label="Задачи"
          active={pathname === "/tasks"}
          collapsed={collapsed}
        />
        <NavItem
          href="/settings"
          icon={Settings}
          label="Настройки"
          active={pathname === "/settings"}
          collapsed={collapsed}
        />
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn("w-full justify-start cursor-pointer", collapsed && "justify-center px-0")}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Выйти</span>}
        </Button>
      </div>
    </aside>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  disabled,
  badge,
  color,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  collapsed: boolean
  disabled?: boolean
  badge?: "done" | "current"
  color?: string
}) {
  return (
    <Link
      href={disabled ? "#" : href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 cursor-pointer",
        active
          ? "bg-sidebar-accent/10 text-sidebar-accent font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-border/50 hover:text-sidebar-foreground",
        disabled && "opacity-40 pointer-events-none",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-sidebar-accent" : color)} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge === "done" && (
            <span className="h-2 w-2 rounded-full bg-success" />
          )}
          {badge === "current" && (
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </>
      )}
    </Link>
  )
}
