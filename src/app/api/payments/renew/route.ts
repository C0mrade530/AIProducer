import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createRecurringPayment, PLANS, type PlanKey } from "@/lib/payments/yookassa"
import { sendSubscriptionExpiringEmail } from "@/lib/email/resend"

/**
 * POST /api/payments/renew — Auto-renew expiring subscriptions
 *
 * Called by external cron (e.g. Supabase Edge Function, cron-job.org)
 * Protected by CRON_SECRET header.
 *
 * Logic:
 * 1. Find subscriptions expiring in next 24h with saved payment method
 * 2. Attempt auto-charge via YooKassa recurring
 * 3. Send warning emails for subscriptions expiring in 3 days (no auto-renew)
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date()

  // ── 1. Auto-renew: subscriptions expiring in <24h with payment_method_id ──
  const renewDeadline = new Date(now)
  renewDeadline.setHours(renewDeadline.getHours() + 24)

  const { data: toRenew } = await supabase
    .from("subscriptions")
    .select("id, workspace_id, plan, payment_method_id, current_period_end")
    .eq("status", "active")
    .not("payment_method_id", "is", null)
    .lte("current_period_end", renewDeadline.toISOString())
    .gt("current_period_end", now.toISOString())

  let renewed = 0
  let failed = 0

  for (const sub of toRenew || []) {
    const planConfig = PLANS[sub.plan as PlanKey]
    if (!planConfig || !sub.payment_method_id) continue

    try {
      const payment = await createRecurringPayment({
        amount: planConfig.price,
        description: `GetProdi — автопродление ${planConfig.name}`,
        paymentMethodId: sub.payment_method_id,
        metadata: {
          workspace_id: sub.workspace_id,
          plan: sub.plan,
          is_recurring: "true",
        },
      })

      if (payment.status === "succeeded") {
        const newEnd = new Date(sub.current_period_end)
        newEnd.setDate(newEnd.getDate() + 30)

        await supabase
          .from("subscriptions")
          .update({
            current_period_start: sub.current_period_end,
            current_period_end: newEnd.toISOString(),
          })
          .eq("id", sub.id)

        // Save payment record
        await supabase.from("payments").insert({
          workspace_id: sub.workspace_id,
          yookassa_payment_id: payment.id,
          amount: planConfig.price,
          currency: "RUB",
          status: "succeeded",
          description: `Автопродление ${planConfig.name}`,
          paid_at: new Date().toISOString(),
        })

        renewed++
      } else {
        // Payment pending — will be handled by webhook
        failed++
      }
    } catch (err) {
      console.error(`Renewal failed for subscription ${sub.id}:`, err)
      failed++
    }
  }

  // ── 2. Warning emails: subscriptions expiring in 3 days without payment method ──
  const warnDeadline = new Date(now)
  warnDeadline.setDate(warnDeadline.getDate() + 3)
  const warnStart = new Date(now)
  warnStart.setDate(warnStart.getDate() + 2)

  const { data: toWarn } = await supabase
    .from("subscriptions")
    .select("id, workspace_id, plan, current_period_end")
    .eq("status", "active")
    .gte("current_period_end", warnStart.toISOString())
    .lte("current_period_end", warnDeadline.toISOString())

  let warned = 0

  for (const sub of toWarn || []) {
    try {
      // Get workspace owner email
      const { data: ws } = await supabase
        .from("workspaces")
        .select("owner_id")
        .eq("id", sub.workspace_id)
        .single()

      if (!ws) continue

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", ws.owner_id)
        .single()

      // Get email from auth — we need to query profiles that have the user's email
      // Since we can't use admin API, we'll check if there's an email stored elsewhere
      // For now, skip email sending if we can't get the email
      // The payment confirmation email was sent via metadata — but for expiry we need another approach
      // We'll use a lightweight approach: store email in profiles during onboarding

      const daysLeft = Math.ceil(
        (new Date(sub.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Note: email sending requires user email in profiles table
      // This will work once we add email field to profiles (see migration 005)
      const { data: profileWithEmail } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", ws.owner_id)
        .single()

      if (profileWithEmail?.email) {
        await sendSubscriptionExpiringEmail(
          profileWithEmail.email,
          profileWithEmail.name || "Эксперт",
          sub.plan,
          daysLeft
        )
        warned++
      }
    } catch (err) {
      console.error(`Warning email failed for subscription ${sub.id}:`, err)
    }
  }

  return NextResponse.json({ renewed, failed, warned })
}
