import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPayment, PLANS, type PlanKey } from "@/lib/payments/yookassa"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { plan, billing } = await request.json()

  if (!plan || !PLANS[plan as PlanKey]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const selectedPlan = PLANS[plan as PlanKey]
  const isAnnual = billing === "annual"
  const price = isAnnual ? selectedPlan.annualPrice : selectedPlan.price
  const periodDays = isAnnual ? 365 : 30

  // Get workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: "No workspace found" }, { status: 404 })
  }

  // Get profile name for email
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single()

  try {
    // Create YooKassa payment
    const payment = await createPayment({
      amount: price,
      description: `GetProdi — ${isAnnual ? "годовая" : "месячная"} подписка ${selectedPlan.name}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&tour=1`,
      metadata: {
        workspace_id: workspace.id,
        plan,
        user_id: user.id,
        user_email: user.email || "",
        user_name: profile?.name || "",
        billing: isAnnual ? "annual" : "monthly",
        period_days: String(periodDays),
      },
    })

    // Save payment record
    await supabase.from("payments").insert({
      workspace_id: workspace.id,
      yookassa_payment_id: payment.id,
      amount: price,
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
