import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPayment } from "@/lib/payments/yookassa"
import { sendPaymentConfirmationEmail } from "@/lib/email/resend"

/**
 * POST /api/payments/webhook — YooKassa webhook handler
 *
 * CRITICAL: Webhooks run WITHOUT an authenticated user session,
 * so they can't bypass RLS with the anon client directly.
 * We use SECURITY DEFINER Postgres functions (activate_subscription,
 * finalize_payment) to safely activate subscriptions as the DB owner.
 *
 * Verifies payment with YooKassa API before activating (prevents spoofed webhooks).
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const supabase = await createClient()

  const event = body.event
  const paymentObject = body.object

  if (!paymentObject?.id) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }

  // Log the event (non-blocking if RLS denies)
  try {
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, workspace_id")
      .eq("yookassa_payment_id", paymentObject.id)
      .maybeSingle()

    if (existingPayment) {
      await supabase.from("payment_events").insert({
        payment_id: existingPayment.id,
        event_type: event,
        payload: body,
      })
    }
  } catch (err) {
    console.error("Payment event log error:", err)
  }

  // ── Handle payment.succeeded ──
  if (event === "payment.succeeded") {
    // Verify payment with YooKassa API (don't trust webhook body alone)
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
    const userId = metadata.user_id

    if (!workspaceId || !plan) {
      console.error("Missing metadata in verified payment:", metadata)
      return NextResponse.json({ ok: true })
    }

    const periodDays = parseInt(metadata.period_days || "30", 10)
    const paymentMethodId =
      verifiedPayment.payment_method?.id ||
      (verifiedPayment as unknown as { payment_method_id?: string }).payment_method_id ||
      null

    // ── Activate subscription via SECURITY DEFINER function (bypasses RLS) ──
    const { error: rpcError } = await supabase.rpc("activate_subscription", {
      p_workspace_id: workspaceId,
      p_plan: plan,
      p_period_days: periodDays,
      p_payment_method_id: paymentMethodId,
    })

    if (rpcError) {
      console.error("activate_subscription RPC error:", rpcError)
      return NextResponse.json({ error: "Subscription activation failed" }, { status: 500 })
    }

    // ── Finalize payment + track referral (also SECURITY DEFINER) ──
    if (userId) {
      const { error: finalizeError } = await supabase.rpc("finalize_payment", {
        p_yookassa_payment_id: paymentObject.id,
        p_paying_user_id: userId,
      })
      if (finalizeError) {
        console.error("finalize_payment RPC error:", finalizeError)
      }
    }

    // ── Send payment confirmation email (non-blocking) ──
    if (metadata.user_email) {
      sendPaymentConfirmationEmail(
        metadata.user_email,
        metadata.user_name || "Эксперт",
        plan,
        parseFloat(verifiedPayment.amount?.value || "0")
      ).catch((err) => console.error("Payment email error:", err))
    }

    // ── Log usage event (best-effort; RLS may deny) ──
    try {
      await supabase.from("usage_events").insert({
        workspace_id: workspaceId,
        event_type: "payment_succeeded",
        metadata: {
          plan,
          amount: verifiedPayment.amount?.value,
          payment_id: verifiedPayment.id,
        },
      })
    } catch (err) {
      console.error("Usage event log error:", err)
    }
  }

  // ── Handle payment.canceled ──
  if (event === "payment.canceled") {
    try {
      await supabase
        .from("payments")
        .update({ status: "cancelled" })
        .eq("yookassa_payment_id", paymentObject.id)
    } catch (err) {
      console.error("Payment cancel error:", err)
    }
  }

  return NextResponse.json({ ok: true })
}
