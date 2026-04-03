import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/referrals — get current user's referral info
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get referral code
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single()

  // Get referral stats
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, status, created_at")
    .eq("referrer_id", user.id)

  const total = referrals?.length || 0
  const registered = referrals?.filter((r) => r.status === "registered").length || 0
  const paid = referrals?.filter((r) => r.status === "paid" || r.status === "rewarded").length || 0

  return NextResponse.json({
    referralCode: profile?.referral_code || null,
    stats: { total, registered, paid },
  })
}
