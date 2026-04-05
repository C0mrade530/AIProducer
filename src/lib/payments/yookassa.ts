/**
 * YooKassa Payment Integration
 *
 * Docs: https://yookassa.ru/developers/api
 *
 * Flow:
 * 1. User selects plan on /pricing
 * 2. POST /api/payments/create → creates YooKassa payment
 * 3. User redirected to YooKassa checkout
 * 4. User pays
 * 5. YooKassa sends webhook → POST /api/payments/webhook
 * 6. We activate subscription
 */

const YOOKASSA_API = "https://api.yookassa.ru/v3"

interface CreatePaymentParams {
  amount: number
  currency?: string
  description: string
  returnUrl: string
  metadata?: Record<string, string>
}

interface YooKassaPayment {
  id: string
  status: string
  amount: { value: string; currency: string }
  confirmation?: { type: string; confirmation_url?: string }
  payment_method?: { id: string; type: string; saved?: boolean }
  metadata?: Record<string, string>
}

/**
 * Создать платёж в YooKassa
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<YooKassaPayment> {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    throw new Error("YooKassa credentials not configured")
  }

  const idempotenceKey = crypto.randomUUID()

  const response = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization:
        "Basic " +
        Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: {
        value: params.amount.toFixed(2),
        currency: params.currency || "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: params.returnUrl,
      },
      capture: true,
      save_payment_method: true,
      description: params.description,
      metadata: params.metadata || {},
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`YooKassa error: ${response.status} ${error}`)
  }

  return response.json()
}

/**
 * Получить информацию о платеже
 */
export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  const response = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
  })

  return response.json()
}

/**
 * Тарифы
 */
export const PLANS = {
  starter: {
    name: "Starter",
    price: 2990,
    annualPrice: 28700, // ~20% скидка (2392₽/мес)
    description: "1 распаковка — полный проход всех 7 агентов",
    features: [
      "1 распаковка (проект)",
      "Все 7 агентов",
      "Сохранение артефактов",
      "Экспорт результатов",
      "Базовый трекер задач",
    ],
    limits: {
      projects: 1,
    },
  },
  pro: {
    name: "Pro",
    price: 5490,
    annualPrice: 52700, // ~20% скидка (4392₽/мес)
    description: "3 распаковки, Telegram-трекер, свободный чат",
    popular: true,
    features: [
      "3 распаковки (проекта)",
      "Все 7 агентов",
      "Telegram-трекер",
      "Свободный чат с трекером",
      "Приоритетная генерация",
      "Экспорт результатов",
    ],
    limits: {
      projects: 3,
    },
  },
  premium: {
    name: "Premium",
    price: 8990,
    annualPrice: 86300, // ~20% скидка (7192₽/мес)
    description: "5 распаковок, Opus для артефактов, VIP-поддержка",
    features: [
      "5 распаковок (проектов)",
      "Все 7 агентов",
      "Telegram-трекер",
      "Свободный чат с трекером",
      "Opus для артефактов",
      "Экспорт результатов",
      "Приоритетная поддержка",
    ],
    limits: {
      projects: 5,
    },
  },
} as const

/**
 * Создать рекуррентный платёж (автосписание) по сохранённому payment_method_id
 */
export async function createRecurringPayment(params: {
  amount: number
  currency?: string
  description: string
  paymentMethodId: string
  metadata?: Record<string, string>
}): Promise<YooKassaPayment> {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    throw new Error("YooKassa credentials not configured")
  }

  const idempotenceKey = crypto.randomUUID()

  const response = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization:
        "Basic " +
        Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: {
        value: params.amount.toFixed(2),
        currency: params.currency || "RUB",
      },
      payment_method_id: params.paymentMethodId,
      capture: true,
      description: params.description,
      metadata: params.metadata || {},
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`YooKassa recurring error: ${response.status} ${error}`)
  }

  return response.json()
}

export type PlanKey = keyof typeof PLANS
