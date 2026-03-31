/**
 * In-memory rate limiter для API routes.
 *
 * Использует sliding window подход.
 * В production при нескольких инстансах стоит переключиться на Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Очистка устаревших записей каждые 60 секунд
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, 60_000)

interface RateLimitConfig {
  /** Максимум запросов в окне */
  limit: number
  /** Размер окна в секундах */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Проверить rate limit для ключа (userId, IP, etc.)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    const resetAt = now + config.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.limit - 1, resetAt }
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  }
}

// Preset configs
export const RATE_LIMITS = {
  /** Agent runs: 20 requests per minute per user */
  agentRun: { limit: 20, windowSeconds: 60 },
  /** Artifact saves: 10 per minute per user */
  artifactSave: { limit: 10, windowSeconds: 60 },
  /** Payment creation: 5 per minute per user */
  paymentCreate: { limit: 5, windowSeconds: 60 },
} as const
