import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPayment } from "@/lib/payments/yookassa"

/**
 * POST /api/payments/webhook — YooKassa webhook handler
 *
 * FIX #4: Verifies payment with YooKassa API before activating subscription.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = await createClient()

  const event = body.event
  const paymentObject = body.object

  if (!paymentObject?.id) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
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
  if (event === "payment.succeeded") {
    // FIX #4: Verify payment with YooKassa API (don't trust webhook body alone)
    let verifiedPayment
    try {
      verifiedPayment = await getPayment(paymentObject.id)
    } catch (err) {
      console.error("Failed to verify payment with YooKassa:", err)
      return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }

    if (verifiedPayment.status !== "succeeded") {
      console.error("Payment not confirmed by YooKassa:", verifiedPayment.status)
      return NextResponse.json({ ok: true }) // Ack but don't activate
    }

    const metadata = verifiedPayment.metadata || {}
    const workspaceId = metadata.workspace_id
    const plan = metadata.plan

    if (!workspaceId || !plan) {
      console.error("Missing metadata in verified payment:", metadata)
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

    // Log
    await supabase.from("usage_events").insert({
      workspace_id: workspaceId,
      event_type: "payment_succeeded",
      metadata: {
        plan,
        amount: verifiedPayment.amount?.value,
        payment_id: verifiedPayment.id,
      },
    })

    await supabase.from("audit_logs").insert({
      user_id: metadata.user_id || null,
      action: "payment.succeeded",
      entity_type: "payment",
      entity_id: existingPayment?.id,
      metadata: { plan, amount: verifiedPayment.amount?.value },
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
