/**
 * Referral System
 *
 * Каждый пользователь получает уникальный реферальный код.
 * За каждого приведённого платящего пользователя — скидка 20%.
 * 5 рефералов = бесплатный месяц.
 *
 * Таблица `referrals`:
 *   id, referrer_id (uuid), referred_id (uuid), status (pending|paid),
 *   created_at, paid_at
 *
 * Таблица `profiles` добавляем поле: referral_code (text, unique)
 * Таблица `profiles` добавляем поле: referred_by (uuid, nullable) — кто привёл
 */

/**
 * Генерирует уникальный реферальный код (8 символов).
 * Формат: "REF-XXXX" где X — из безопасного набора.
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
  return `REF-${code}`
}

/**
 * Рассчитывает скидку на основе количества оплативших рефералов.
 * 1 реферал = 20%, 2 = 40%, ..., 5+ = 100% (бесплатный месяц).
 */
export function calculateReferralDiscount(paidReferrals: number): {
  percent: number
  isFreeMonth: boolean
} {
  const percent = Math.min(paidReferrals * 20, 100)
  return {
    percent,
    isFreeMonth: percent >= 100,
  }
}

/**
 * Строит реферальную ссылку.
 */
export function buildReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}/register?ref=${code}`
}
