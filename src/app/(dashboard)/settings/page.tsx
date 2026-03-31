"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  User,
  MessageCircle,
  CreditCard,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    name: string
    niche: string
    bio: string
  } | null>(null)
  const [telegram, setTelegram] = useState<{
    username: string | null
    linked_at: string | null
  } | null>(null)
  const [subscription, setSubscription] = useState<{
    plan: string
    status: string
    current_period_end: string
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [linkingTelegram, setLinkingTelegram] = useState(false)
  const [telegramLink, setTelegramLink] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, niche, bio")
      .eq("id", user.id)
      .single()

    const { data: telegramData } = await supabase
      .from("telegram_accounts")
      .select("username, linked_at")
      .eq("user_id", user.id)
      .single()

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (workspace) {
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("workspace_id", workspace.id)
        .single()
      setSubscription(subData)
    }

    setProfile(profileData)
    setTelegram(telegramData)
  }

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").update(profile).eq("id", user.id)
    }
    setSaving(false)
  }

  const generateTelegramLink = async () => {
    setLinkingTelegram(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Generate linking token
    const token = crypto.randomUUID().replace(/-/g, "").substring(0, 16)

    // Check if telegram_account exists
    const { data: existing } = await supabase
      .from("telegram_accounts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (existing) {
      await supabase
        .from("telegram_accounts")
        .update({ linking_token: token, telegram_user_id: null, linked_at: null })
        .eq("user_id", user.id)
    } else {
      await supabase.from("telegram_accounts").insert({
        user_id: user.id,
        linking_token: token,
      })
    }

    // Bot username — will be fetched dynamically in production
    setTelegramLink(`https://t.me/aiproducer_bot?start=${token}`)
    setLinkingTelegram(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(telegramLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const planLabels: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    premium: "Premium",
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <h1 className="font-heading text-3xl font-bold">Настройки</h1>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Профиль</CardTitle>
            </div>
            <CardDescription>Основная информация о тебе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Имя</label>
              <Input
                value={profile?.name || ""}
                onChange={(e) =>
                  setProfile((p) => (p ? { ...p, name: e.target.value } : p))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ниша</label>
              <Input
                value={profile?.niche || ""}
                onChange={(e) =>
                  setProfile((p) => (p ? { ...p, niche: e.target.value } : p))
                }
              />
            </div>
            <Button
              onClick={saveProfile}
              loading={saving}
              className="cursor-pointer"
            >
              Сохранить
            </Button>
          </CardContent>
        </Card>

        {/* Telegram */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Telegram</CardTitle>
            </div>
            <CardDescription>
              Привяжи Telegram для уведомлений и трекера
            </CardDescription>
          </CardHeader>
          <CardContent>
            {telegram?.linked_at ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="font-medium">
                    @{telegram.username || "Привязан"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Привязан{" "}
                    {new Date(telegram.linked_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateTelegramLink}
                  className="ml-auto cursor-pointer"
                >
                  Перепривязать
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Привяжи Telegram, чтобы трекер мог отправлять напоминания и
                  мотивацию.
                </p>

                {telegramLink ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input value={telegramLink} readOnly className="text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyLink}
                        className="shrink-0 cursor-pointer"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Открыть в Telegram
                    </a>
                    <p className="text-xs text-muted-foreground">
                      Нажмите &quot;Start&quot; в боте, чтобы завершить
                      привязку. После этого обновите страницу.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={generateTelegramLink}
                    loading={linkingTelegram}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Привязать Telegram
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Подписка</CardTitle>
            </div>
            <CardDescription>Управление тарифом</CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-sm px-3 py-1">
                    {planLabels[subscription.plan] || subscription.plan}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Активна до{" "}
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Сменить тариф
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Нет активной подписки
                </p>
                <Link href="/pricing">
                  <Button className="cursor-pointer">Выбрать тариф</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
