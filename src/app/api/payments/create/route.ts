import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPayment, PLANS, type PlanKey } from "@/lib/payments/yookassa"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { paymentCreateSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate limit
  const rl = checkRateLimit(`payment:${user.id}`, RATE_LIMITS.paymentCreate)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    })
  }

  const body = await request.json()
  const parsed = paymentCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { plan } = parsed.data
  const selectedPlan = PLANS[plan]

  // Get workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  }

  try {
    // Create YooKassa payment
    const payment = await createPayment({
      amount: selectedPlan.price,
      description: `AIProducer — подписка ${selectedPlan.name}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/agent/unpacker?welcome=1`,
      metadata: {
        workspace_id: workspace.id,
        plan,
        user_id: user.id,
      },
    })

    // Save payment record
    await supabase.from("payments").insert({
      workspace_id: workspace.id,
      yookassa_payment_id: payment.id,
      amount: selectedPlan.price,
      currency: "RUB",
      status: "pending",
      description: `Подписка ${selectedPlan.name}`,
    })

    // Return checkout URL
    const checkoutUrl = payment.confirmation?.confirmation_url

    return NextResponse.json({ checkoutUrl, paymentId: payment.id })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
