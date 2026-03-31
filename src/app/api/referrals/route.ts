import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  generateReferralCode,
  calculateReferralDiscount,
  buildReferralLink,
} from "@/lib/referrals"

/**
 * GET /api/referrals — get referral stats & code for current user
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get or create referral code
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single()

  let referralCode = profile?.referral_code

  if (!referralCode) {
    referralCode = generateReferralCode()
    await supabase
      .from("profiles")
      .update({ referral_code: referralCode })
      .eq("id", user.id)
  }

  // Count referrals
  const { count: totalReferrals } = await supabase
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)

  const { count: paidReferrals } = await supabase
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("status", "paid")

  const discount = calculateReferralDiscount(paidReferrals || 0)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiproducer.ru"
  const referralLink = buildReferralLink(referralCode, baseUrl)

  return NextResponse.json({
    code: referralCode,
    link: referralLink,
    stats: {
      total: totalReferrals || 0,
      paid: paidReferrals || 0,
      discount: discount.percent,
      isFreeMonth: discount.isFreeMonth,
    },
  })
}
