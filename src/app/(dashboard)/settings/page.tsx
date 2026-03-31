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
  Gift,
  Clock,
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
  const [notificationTime, setNotificationTime] = useState("09:00")
  const [savingTime, setSavingTime] = useState(false)
  const [referral, setReferral] = useState<{
    code: string
    link: string
    stats: { total: number; paid: number; discount: number; isFreeMonth: boolean }
  } | null>(null)
  const [referralCopied, setReferralCopied] = useState(false)

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

    // Load notification time from telegram_accounts
    if (telegramData?.linked_at) {
      const { data: tgSettings } = await supabase
        .from("telegram_accounts")
        .select("notification_time")
        .eq("user_id", user.id)
        .single()
      if (tgSettings?.notification_time) {
        setNotificationTime(tgSettings.notification_time)
      }
    }

    // Load referral data
    try {
      const refRes = await fetch("/api/referrals")
      if (refRes.ok) {
        const refData = await refRes.json()
        setReferral(refData)
      }
    } catch {
      // Non-critical
    }
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

    // Generate simple 6-char linking code (e.g. "A3K-9MX")
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I confusion
    const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    const token = `${part1}${part2}` // stored without dash, displayed with

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

  const saveNotificationTime = async () => {
    setSavingTime(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("telegram_accounts")
        .update({ notification_time: notificationTime })
        .eq("user_id", user.id)
    }
    setSavingTime(false)
  }

  const copyReferralLink = () => {
    if (referral?.link) {
      navigator.clipboard.writeText(referral.link)
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 2000)
    }
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
              <div className="space-y-0">
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
                {/* Notification time setting */}
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Время ежедневной мотивации</label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="time"
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-xs text-muted-foreground">по Москве (МСК)</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveNotificationTime}
                    loading={savingTime}
                    className="cursor-pointer"
                  >
                    Сохранить
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Каждый день в это время бот пришлёт мотивацию и план задач
                </p>
              </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Привяжи Telegram, чтобы трекер мог отправлять напоминания и
                  мотивацию.
                </p>

                {telegramLink ? (
                  <div className="space-y-4">
                    {/* Show code prominently */}
                    <div className="bg-muted/50 rounded-xl p-5 text-center">
                      <p className="text-xs text-muted-foreground mb-2">Твой код привязки:</p>
                      <p className="font-mono text-3xl font-bold tracking-widest">
                        {telegramLink.split("start=")[1]?.substring(0, 3)}-{telegramLink.split("start=")[1]?.substring(3, 6)}
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      <p className="text-sm font-medium">Как привязать:</p>
                      <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                        <li>Открой бота <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@aiproducer_bot</a></li>
                        <li>Нажми Start</li>
                        <li>Бот привяжет аккаунт автоматически</li>
                      </ol>
                    </div>
                    <div className="flex gap-2">
                      <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" className="w-full cursor-pointer">
                          <ExternalLink className="h-4 w-4" />
                          Открыть бота
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
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
        {/* Referral Program */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Реферальная программа</CardTitle>
            </div>
            <CardDescription>
              Приглашай друзей и получай скидки на подписку
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referral ? (
              <div className="space-y-4">
                {/* How it works */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Как это работает:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1 оплативший друг = <b>скидка 20%</b> на следующий месяц</li>
                    <li>5 друзей = <b>бесплатный месяц</b></li>
                    <li>Скидки суммируются!</li>
                  </ul>
                </div>

                {/* Referral link */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Твоя реферальная ссылка:
                  </label>
                  <div className="flex items-center gap-2">
                    <Input value={referral.link} readOnly className="text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyReferralLink}
                      className="shrink-0 cursor-pointer"
                    >
                      {referralCopied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{referral.stats.total}</p>
                    <p className="text-xs text-muted-foreground">Приглашённых</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{referral.stats.paid}</p>
                    <p className="text-xs text-muted-foreground">Оплативших</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {referral.stats.isFreeMonth ? "FREE" : `${referral.stats.discount}%`}
                    </p>
                    <p className="text-xs text-muted-foreground">Скидка</p>
                  </div>
                </div>

                {referral.stats.isFreeMonth && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-success">
                      Следующий месяц бесплатно!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
