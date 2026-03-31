import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPayment, PLANS, type PlanKey } from "@/lib/payments/yookassa"

// YooKassa webhook IP ranges (https://yookassa.ru/developers/using-api/webhooks)
const YOOKASSA_IPS = [
  "185.71.76.",
  "185.71.77.",
  "77.75.153.",
  "77.75.156.",
  "77.75.157.",
  "2a02:5180::",
]

function isYooKassaIP(ip: string): boolean {
  return YOOKASSA_IPS.some((prefix) => ip.startsWith(prefix))
}

/**
 * POST /api/payments/webhook — YooKassa webhook handler
 *
 * YooKassa sends notifications about payment status changes.
 * We verify the payment and activate the subscription.
 *
 * Security:
 * 1. IP whitelist check (YooKassa IP ranges)
 * 2. Payment verification via YooKassa API
 * 3. Plan validation against known plans
 */
export async function POST(request: NextRequest) {
  // Verify source IP
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const sourceIp = forwardedFor?.split(",")[0]?.trim() || realIp || ""

  if (sourceIp && !isYooKassaIP(sourceIp)) {
    console.warn("Webhook from non-YooKassa IP:", sourceIp)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const supabase = await createClient()

  const event = body.event
  const paymentObject = body.object

  if (!paymentObject?.id) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }

  // Verify payment exists in YooKassa (prevents forged webhooks)
  let verifiedPayment
  try {
    verifiedPayment = await getPayment(paymentObject.id)
    if (verifiedPayment.status !== paymentObject.status) {
      console.error("Payment status mismatch:", {
        webhook: paymentObject.status,
        api: verifiedPayment.status,
      })
      return NextResponse.json({ error: "Status mismatch" }, { status: 400 })
    }
  } catch (err) {
    console.error("Failed to verify payment with YooKassa:", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 502 })
  }

  // Log the event
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, workspace_id")
    .eq("yookassa_payment_id", paymentObject.id)
    .single()

  if (existingPayment) {
    await supabase.from("payment_events").insert({
      payment_id: existingPayment.id,
      event_type: event,
      payload: body,
    })
  }

  // Handle payment.succeeded
  if (event === "payment.succeeded" && paymentObject.status === "succeeded") {
    const metadata = verifiedPayment.metadata || {}
    const workspaceId = metadata.workspace_id
    const plan = metadata.plan

    if (!workspaceId || !plan) {
      console.error("Missing metadata in webhook:", metadata)
      return NextResponse.json({ ok: true })
    }

    // Validate plan against known plans
    if (!PLANS[plan as PlanKey]) {
      console.error("Unknown plan in webhook:", plan)
      return NextResponse.json({ ok: true })
    }

    // Update payment status
    await supabase
      .from("payments")
      .update({
        status: "succeeded",
        paid_at: new Date().toISOString(),
      })
      .eq("yookassa_payment_id", paymentObject.id)

    // Create or update subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("workspace_id", workspaceId)
      .single()

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setDate(periodEnd.getDate() + 30)

    if (existingSub) {
      await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .eq("id", existingSub.id)
    } else {
      await supabase.from("subscriptions").insert({
        workspace_id: workspaceId,
        plan,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
    }

    // Create first project if none exists (new user just paid after registration)
    const { data: existingProjects } = await supabase
      .from("projects")
      .select("id")
      .eq("workspace_id", workspaceId)
      .limit(1)

    if (!existingProjects || existingProjects.length === 0) {
      await supabase.from("projects").insert({
        workspace_id: workspaceId,
        name: "Мой первый продукт",
      })
    }

    // Log usage
    await supabase.from("usage_events").insert({
      workspace_id: workspaceId,
      event_type: "payment_succeeded",
      metadata: {
        plan,
        amount: paymentObject.amount?.value,
        payment_id: paymentObject.id,
      },
    })

    // Audit log
    await supabase.from("audit_logs").insert({
      user_id: metadata.user_id || null,
      action: "payment.succeeded",
      entity_type: "payment",
      entity_id: existingPayment?.id,
      metadata: { plan, amount: paymentObject.amount?.value },
    })
  }

  // Handle payment.canceled
  if (event === "payment.canceled") {
    await supabase
      .from("payments")
      .update({ status: "cancelled" })
      .eq("yookassa_payment_id", paymentObject.id)
  }

  return NextResponse.json({ ok: true })
}
