"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Calendar,
  CreditCard,
  MessageSquare,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Send,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserData {
  profile: {
    id: string
    name: string | null
    email: string | null
    niche: string | null
    bio: string | null
    onboarding_completed: boolean
    created_at: string
    referral_code: string | null
    referred_by: string | null
    tracker_motivation: boolean
    tracker_daily_fact: boolean
    tracker_notify_time: string
  } | null
  subscription: {
    plan: string
    status: string
    current_period_start: string
    current_period_end: string
    payment_method_id: string | null
  } | null
  workspace: { id: string; title: string; niche: string } | null
  projects: Array<{
    id: string
    name: string
    current_step: number
    created_at: string
  }>
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    description: string
    paid_at: string | null
    created_at: string
  }>
  telegram: { username: string; first_name: string; linked_at: string } | null
}

interface ChatRun {
  run_id: string
  agent_code: string
  agent_name: string
  project_id: string
  project_name: string
  status: string
  created_at: string
  finished_at: string | null
  messages: Array<{
    role: string
    content: string
    created_at: string
  }>
}

interface Artifact {
  id: string
  title: string
  type: string
  status: string
  content_md: string
  agent_code: string
  project_name: string
  created_at: string
}

const AGENT_NAMES: Record<string, string> = {
  unpacker: "Распаковщик",
  methodologist: "Методолог",
  promotion: "Маркетолог",
  warmup: "Прогревщик",
  leadmagnet: "Лид-магнит",
  sales: "Продажник",
  tracker: "Трекер",
}

const AGENT_COLORS: Record<string, string> = {
  unpacker: "text-blue-400 bg-blue-500/10",
  methodologist: "text-emerald-400 bg-emerald-500/10",
  promotion: "text-orange-400 bg-orange-500/10",
  warmup: "text-pink-400 bg-pink-500/10",
  leadmagnet: "text-cyan-400 bg-cyan-500/10",
  sales: "text-amber-400 bg-amber-500/10",
  tracker: "text-violet-400 bg-violet-500/10",
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [data, setData] = useState<UserData | null>(null)
  const [chats, setChats] = useState<ChatRun[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set())
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"chats" | "artifacts">("chats")

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Не удалось загрузить данные")
      }
      const json = await res.json()
      setData(json.user)
      setChats(json.chats || [])
      setArtifacts(json.artifacts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  const toggleRun = (runId: string) => {
    setExpandedRuns((prev) => {
      const next = new Set(prev)
      if (next.has(runId)) next.delete(runId)
      else next.add(runId)
      return next
    })
  }

  const toggleArtifact = (artifactId: string) => {
    setExpandedArtifacts((prev) => {
      const next = new Set(prev)
      if (next.has(artifactId)) next.delete(artifactId)
      else next.add(artifactId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data || !data.profile) {
    return (
      <div className="space-y-4">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Назад к списку
        </Link>
        <div className="glass border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-destructive">{error || "Пользователь не найден"}</p>
        </div>
      </div>
    )
  }

  const { profile, subscription, workspace, projects, payments, telegram } = data
  const totalPaid = payments.filter((p) => p.status === "succeeded").reduce((s, p) => s + Number(p.amount), 0)
  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleString("ru-RU") : "—")
  const fmtMoney = (n: number) => `${new Intl.NumberFormat("ru-RU").format(n)} ₽`

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к списку
      </Link>

      {/* ═══ Profile card ═══ */}
      <div className="glass border border-gray-800/40 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <UserIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">
                {profile.name || "Без имени"}
              </h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                {profile.email || "—"}
              </div>
              {profile.niche && (
                <div className="text-xs text-violet-400 mt-1">{profile.niche}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {subscription ? (
              <Badge variant={subscription.status === "active" ? "success" : "muted"}>
                {subscription.plan} · {subscription.status}
              </Badge>
            ) : (
              <Badge variant="muted">без подписки</Badge>
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">О себе</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Profile meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800/40">
          <MetaItem label="Регистрация" value={fmtDate(profile.created_at)} icon={Calendar} />
          <MetaItem
            label="Onboarding"
            value={profile.onboarding_completed ? "Пройден" : "Не завершён"}
            valueClass={profile.onboarding_completed ? "text-success" : "text-amber-400"}
          />
          <MetaItem
            label="Workspace"
            value={workspace?.title || "—"}
          />
          <MetaItem
            label="Реферал-код"
            value={profile.referral_code || "—"}
            valueClass="font-mono"
          />
          {subscription && (
            <>
              <MetaItem
                label="Подписка до"
                value={fmtDate(subscription.current_period_end)}
              />
              <MetaItem
                label="Автопродление"
                value={subscription.payment_method_id ? "Да" : "Нет"}
              />
            </>
          )}
          {telegram && (
            <MetaItem
              label="Telegram"
              value={`@${telegram.username || telegram.first_name}`}
              icon={Send}
            />
          )}
          <MetaItem
            label="Всего оплат"
            value={fmtMoney(totalPaid)}
            valueClass="text-emerald-400 font-medium"
            icon={CreditCard}
          />
        </div>
      </div>

      {/* ═══ Projects ═══ */}
      {projects.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3">
            Проекты <span className="text-muted-foreground text-sm font-normal">({projects.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projects.map((p) => (
              <div key={p.id} className="glass border border-gray-800/40 rounded-xl p-4">
                <h3 className="font-medium truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Шаг {p.current_step}/7 · создан {fmtDate(p.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Payments ═══ */}
      {payments.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3">
            Платежи <span className="text-muted-foreground text-sm font-normal">({payments.length})</span>
          </h2>
          <div className="glass border border-gray-800/40 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-gray-800/40">
                <tr className="text-left">
                  <th className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Дата</th>
                  <th className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Описание</th>
                  <th className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Сумма</th>
                  <th className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Статус</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/20">
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {fmtDate(p.paid_at || p.created_at)}
                    </td>
                    <td className="px-4 py-2">{p.description || "—"}</td>
                    <td className="px-4 py-2 font-medium">{fmtMoney(Number(p.amount))}</td>
                    <td className="px-4 py-2">
                      <Badge variant={p.status === "succeeded" ? "success" : "muted"}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Tabs: Chats / Artifacts ═══ */}
      <div>
        <div className="flex items-center gap-1 border-b border-gray-800/40 mb-4">
          <button
            onClick={() => setActiveTab("chats")}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === "chats"
                ? "border-primary text-white"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-1.5" />
            Диалоги с агентами ({chats.length})
          </button>
          <button
            onClick={() => setActiveTab("artifacts")}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === "artifacts"
                ? "border-primary text-white"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-1.5" />
            Артефакты ({artifacts.length})
          </button>
        </div>

        {/* Chats */}
        {activeTab === "chats" && (
          <div className="space-y-3">
            {chats.length === 0 && (
              <div className="glass border border-gray-800/40 rounded-xl p-8 text-center text-muted-foreground text-sm">
                Нет диалогов
              </div>
            )}
            {chats.map((run) => {
              const expanded = expandedRuns.has(run.run_id)
              const agentColor = AGENT_COLORS[run.agent_code] || "text-gray-400 bg-gray-500/10"
              return (
                <div
                  key={run.run_id}
                  className="glass border border-gray-800/40 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleRun(run.run_id)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className={`h-8 w-8 rounded-lg ${agentColor} flex items-center justify-center shrink-0`}>
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {AGENT_NAMES[run.agent_code] || run.agent_code}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {run.project_name} · {run.messages.length} сообщений · {fmtDate(run.created_at)}
                      </div>
                    </div>
                    <Badge variant={run.status === "completed" ? "success" : "muted"}>
                      {run.status}
                    </Badge>
                  </button>
                  {expanded && (
                    <div className="border-t border-gray-800/40 p-4 space-y-3 max-h-[500px] overflow-y-auto bg-black/20">
                      {run.messages.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Пустой диалог
                        </p>
                      ) : (
                        run.messages.map((msg, i) => (
                          <div
                            key={i}
                            className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-blue-500/10 border border-blue-500/20 ml-8"
                                : msg.role === "assistant"
                                  ? "bg-white/5 border border-gray-800/60 mr-8"
                                  : "bg-amber-500/10 border border-amber-500/20"
                            }`}
                          >
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                              {msg.role === "user" ? "Юзер" : msg.role === "assistant" ? "Агент" : "System"} · {new Date(msg.created_at).toLocaleString("ru-RU")}
                            </div>
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Artifacts */}
        {activeTab === "artifacts" && (
          <div className="space-y-3">
            {artifacts.length === 0 && (
              <div className="glass border border-gray-800/40 rounded-xl p-8 text-center text-muted-foreground text-sm">
                Нет артефактов
              </div>
            )}
            {artifacts.map((a) => {
              const expanded = expandedArtifacts.has(a.id)
              const agentColor = AGENT_COLORS[a.agent_code] || "text-gray-400 bg-gray-500/10"
              return (
                <div key={a.id} className="glass border border-gray-800/40 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleArtifact(a.id)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className={`h-8 w-8 rounded-lg ${agentColor} flex items-center justify-center shrink-0`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {AGENT_NAMES[a.agent_code] || a.agent_code} · {a.project_name} · {fmtDate(a.created_at)}
                      </div>
                    </div>
                    <Badge variant={a.status === "final" ? "success" : "muted"}>
                      {a.status}
                    </Badge>
                  </button>
                  {expanded && (
                    <div className="border-t border-gray-800/40 p-5 bg-black/20 max-h-[500px] overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap break-words text-gray-300 font-sans">
                        {a.content_md}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function MetaItem({
  label,
  value,
  valueClass = "",
  icon: Icon,
}: {
  label: string
  value: string
  valueClass?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm ${valueClass}`}>{value}</p>
    </div>
  )
}
