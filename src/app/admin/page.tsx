"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  CreditCard,
  TrendingUp,
  MessageSquare,
  FileText,
  CheckCircle2,
  ArrowRight,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Stats {
  total_users: number
  onboarded_users: number
  active_subscriptions: number
  active_by_plan: Record<string, number>
  total_revenue_rub: number
  revenue_30d_rub: number
  total_payments: number
  new_users_today: number
  new_users_7d: number
  new_users_30d: number
  total_artifacts: number
  total_messages: number
}

interface AdminUser {
  user_id: string
  name: string
  email: string
  niche: string | null
  onboarding_completed: boolean
  created_at: string
  plan: string | null
  subscription_status: string | null
  subscription_ends: string | null
  current_step: number
  projects_count: number
  messages_count: number
  artifacts_count: number
  total_paid: string | number
}

const AGENT_NAMES: Record<number, string> = {
  1: "Распаковщик",
  2: "Методолог",
  3: "Маркетолог",
  4: "Прогревщик",
  5: "Лид-магнит",
  6: "Продажи",
  7: "Трекер",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
      ])

      if (!statsRes.ok) throw new Error("Не удалось загрузить статистику")
      if (!usersRes.ok) throw new Error("Не удалось загрузить пользователей")

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      setStats(statsData.stats)
      setUsers(usersData.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.niche?.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass border border-destructive/20 rounded-xl p-6 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n)
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("ru-RU") : "—")
  const fmtMoney = (n: number) => `${fmt(n)} ₽`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">Всё, что происходит в GetProdi — в одном месте</p>
      </div>

      {/* ═══ STATS CARDS ═══ */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Пользователей"
            value={fmt(stats.total_users)}
            sub={`${stats.onboarded_users} прошли onboarding`}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            icon={CheckCircle2}
            label="Активных подписок"
            value={fmt(stats.active_subscriptions)}
            sub={Object.entries(stats.active_by_plan)
              .map(([p, c]) => `${p}: ${c}`)
              .join(" · ") || "нет активных"}
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatCard
            icon={CreditCard}
            label="Доход всего"
            value={fmtMoney(Number(stats.total_revenue_rub))}
            sub={`${fmt(stats.total_payments)} оплат`}
            color="text-violet-400"
            bg="bg-violet-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Доход за 30 дней"
            value={fmtMoney(Number(stats.revenue_30d_rub))}
            sub={`+${stats.new_users_30d} новых юзеров`}
            color="text-amber-400"
            bg="bg-amber-500/10"
          />
        </div>
      )}

      {/* Secondary stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MiniStat label="Сегодня новых" value={fmt(stats.new_users_today)} />
          <MiniStat label="За 7 дней" value={fmt(stats.new_users_7d)} />
          <MiniStat label="Сообщений всего" value={fmt(stats.total_messages)} icon={MessageSquare} />
          <MiniStat label="Артефактов" value={fmt(stats.total_artifacts)} icon={FileText} />
          <MiniStat
            label="Ср. чек"
            value={stats.total_payments > 0 ? fmtMoney(Math.round(Number(stats.total_revenue_rub) / stats.total_payments)) : "—"}
          />
        </div>
      )}

      {/* ═══ USER LIST ═══ */}
      <div id="users" className="scroll-mt-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold">
            Пользователи <span className="text-muted-foreground text-sm font-normal">({users.length})</span>
          </h2>
          <div className="relative w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, email, нише..."
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="glass border border-gray-800/40 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-gray-800/40">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Юзер</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Тариф</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Шаг</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Активность</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Оплатил</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Регистрация</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      {search ? "Никого не найдено" : "Пока нет пользователей"}
                    </td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-gray-800/20 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium truncate max-w-[200px]">{u.name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {u.email || "—"}
                      </div>
                      {u.niche && (
                        <div className="text-[10px] text-violet-400 mt-0.5 truncate max-w-[200px]">
                          {u.niche}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.plan ? (
                        <Badge variant={u.subscription_status === "active" ? "success" : "muted"}>
                          {u.plan}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">нет</span>
                      )}
                      {u.subscription_ends && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          до {fmtDate(u.subscription_ends)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {u.current_step}/7
                      </div>
                      {u.current_step > 0 && u.current_step <= 7 && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {AGENT_NAMES[u.current_step]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span>
                          <span className="font-medium">{u.messages_count}</span>{" "}
                          <span className="text-muted-foreground">сообщ.</span>
                        </span>
                        <span>
                          <span className="font-medium">{u.artifacts_count}</span>{" "}
                          <span className="text-muted-foreground">артеф.</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {Number(u.total_paid) > 0 ? fmtMoney(Number(u.total_paid)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {fmtDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.user_id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Детали
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  color: string
  bg: string
}) {
  return (
    <div className="glass border border-gray-800/40 rounded-xl p-4">
      <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="font-heading text-2xl font-bold">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1 truncate">{sub}</p>}
    </div>
  )
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="glass border border-gray-800/40 rounded-lg px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-lg font-heading font-bold">{value}</p>
    </div>
  )
}
