import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Generate a readable 8-char referral code.
 * Avoids ambiguous characters (0/O, 1/I/l).
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * GET /api/referrals — get current user's referral info.
 * Auto-generates a referral code if the user doesn't have one yet
 * (fallback for users created before the DB trigger existed).
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
    .maybeSingle()

  let referralCode = profile?.referral_code

  // Auto-generate code if missing
  if (!referralCode) {
    // Retry a few times in case of unique collision
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateReferralCode()
      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: candidate })
        .eq("id", user.id)

      if (!error) {
        referralCode = candidate
        break
      }
    }
  }

  // Get referral stats
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, status, created_at")
    .eq("referrer_id", user.id)

  const total = referrals?.length || 0
  const registered = referrals?.filter((r) => r.status === "registered").length || 0
  const paid = referrals?.filter((r) => r.status === "paid" || r.status === "rewarded").length || 0

  return NextResponse.json({
    referralCode: referralCode || null,
    stats: { total, registered, paid },
  })
}
