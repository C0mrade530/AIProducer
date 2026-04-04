"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/agents/constants"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  profile: { name: string; niche: string } | null
  currentStep: number
  plan?: string
}

export function Sidebar({ profile, currentStep, plan }: SidebarProps) {
  const hasTrackerAccess = plan === "pro" || plan === "premium"
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background border-b flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center cursor-pointer"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 ml-3 cursor-pointer">
          <ProdiLogo size={32} />
          <span className="font-heading text-lg font-bold">GetProdi</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: drawer */}
      <aside
        className={cn(
          "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          // Desktop
          "hidden md:flex",
          collapsed ? "w-16" : "w-64",
          // Mobile drawer
          "md:relative fixed top-0 left-0 bottom-0 z-50",
          mobileOpen ? "flex" : "hidden md:flex",
          "w-64" // Mobile always full width
        )}
      >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border relative">
        <div className="absolute bottom-0 left-4 right-4 accent-line" />
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer" onClick={closeMobile}>
          <ProdiLogo size={32} />
          {!collapsed && (
            <span className="font-heading text-lg font-bold">GetProdi</span>
          )}
        </Link>
        {/* Close button for mobile, collapse for desktop */}
        <button
          onClick={() => (mobileOpen ? closeMobile() : setCollapsed(!collapsed))}
          className="h-7 w-7 rounded-md hover:bg-sidebar-border/50 flex items-center justify-center cursor-pointer transition-colors"
          aria-label={mobileOpen ? "Закрыть" : collapsed ? "Развернуть" : "Свернуть"}
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : collapsed ? (
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
          {profile.niche && (
            <p className="text-xs text-muted-foreground truncate">{profile.niche}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <NavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Обзор"
          active={pathname === "/dashboard"}
          collapsed={collapsed}
          onMobileClick={closeMobile}
        />

        {!collapsed && (
          <p className="px-3 pt-4 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Агенты
          </p>
        )}
        {AGENTS.map((agent) => {
          const isActive = pathname === `/agent/${agent.code}`
          // Tracker is always unlocked for Pro/Premium
          const isTrackerFreeChat = agent.code === "tracker" && hasTrackerAccess
          const isLocked = isTrackerFreeChat ? false : agent.step > currentStep + 1
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
              tooltip={agent.name}
              onMobileClick={closeMobile}
            />
          )
        })}

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
          tooltip="Задачи"
          onMobileClick={closeMobile}
        />
        <NavItem
          href="/settings"
          icon={Settings}
          label="Настройки"
          active={pathname === "/settings"}
          collapsed={collapsed}
          tooltip="Настройки"
          onMobileClick={closeMobile}
        />
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn("w-full justify-start cursor-pointer", collapsed && "justify-center px-0")}
          onClick={() => {
            closeMobile()
            handleLogout()
          }}
          title="Выйти"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Выйти</span>}
        </Button>
      </div>
    </aside>
    </>
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
  tooltip,
  onMobileClick,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  collapsed: boolean
  disabled?: boolean
  badge?: "done" | "current"
  color?: string
  tooltip?: string
  onMobileClick?: () => void
}) {
  return (
    <Link
      href={disabled ? "#" : href}
      onClick={onMobileClick}
      title={collapsed ? (tooltip || label) : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
        active
          ? "bg-sidebar-accent/10 text-sidebar-accent font-medium shadow-[0_0_12px_hsl(262_85%_62%/0.15)]"
          : "text-sidebar-foreground/60 hover:bg-sidebar-border/40 hover:text-sidebar-foreground",
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
