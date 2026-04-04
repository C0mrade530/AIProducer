import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://getprodi.ru"

/* ═══ Base email wrapper — dark premium style ═══ */
function emailWrapper(content: string) {
  return `
    <div style="background: #000000; padding: 40px 16px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="max-width: 520px; margin: 0 auto;">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #0a0a1a; border: 1px solid #1a1a2e; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;">
            <span style="color: white; font-size: 18px; font-weight: 700;">&#9654; GetProdi</span>
          </div>
        </div>
        <!-- Content card -->
        <div style="background: #0a0a1a; border: 1px solid #1a1a2e; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
          ${content}
        </div>
        <!-- Footer -->
        <div style="text-align: center; padding-top: 16px;">
          <p style="color: #4a4a5a; font-size: 12px; margin: 0;">
            &copy; GetProdi ${new Date().getFullYear()} &middot; <a href="${APP_URL}" style="color: #7c3aed; text-decoration: none;">getprodi.ru</a>
          </p>
        </div>
      </div>
    </div>
  `
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await resend.emails.send({
    from: "GetProdi <noreply@getprodi.ru>",
    to,
    subject,
    html,
  })

  if (error) {
    console.error("Resend error:", error)
    throw error
  }

  return data
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Добро пожаловать в GetProdi!",
    html: emailWrapper(`
      <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">Привет, ${name}!</h1>
      <div style="height: 2px; background: linear-gradient(90deg, #7c3aed, #3b82f6, transparent); border-radius: 2px; margin-bottom: 20px;"></div>
      <p style="color: #a0a0b0; line-height: 1.7; font-size: 15px; margin: 0 0 16px 0;">
        Рады видеть тебя в GetProdi. У тебя теперь есть доступ к 7 AI-агентам, которые заменят целую команду: продюсера, методолога, маркетолога и копирайтера.
      </p>
      <p style="color: #a0a0b0; line-height: 1.7; font-size: 15px; margin: 0 0 24px 0;">
        <strong style="color: #e0e0e0;">Начни с Распаковщика</strong> — он поможет найти твоё позиционирование и понять, как себя преподнести.
      </p>
      <div style="text-align: center; margin: 28px 0 8px 0;">
        <a href="${APP_URL}/dashboard"
           style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Перейти в Dashboard
        </a>
      </div>
    `),
  })
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  amount: number
) {
  const planLabels: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    premium: "Premium",
  }

  return sendEmail({
    to,
    subject: `Подписка ${planLabels[plan] || plan} активирована!`,
    html: emailWrapper(`
      <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">Оплата прошла успешно!</h1>
      <div style="height: 2px; background: linear-gradient(90deg, #10b981, #3b82f6, transparent); border-radius: 2px; margin-bottom: 20px;"></div>
      <p style="color: #a0a0b0; line-height: 1.7; font-size: 15px; margin: 0 0 20px 0;">
        ${name}, твоя подписка <strong style="color: #e0e0e0;">${planLabels[plan] || plan}</strong> активирована. Все 7 AI-агентов готовы к работе.
      </p>
      <div style="background: #111122; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #6a6a7a; font-size: 13px; padding: 6px 0;">Тариф</td>
            <td style="color: #e0e0e0; font-size: 13px; padding: 6px 0; text-align: right; font-weight: 600;">${planLabels[plan] || plan}</td>
          </tr>
          <tr>
            <td style="color: #6a6a7a; font-size: 13px; padding: 6px 0;">Сумма</td>
            <td style="color: #e0e0e0; font-size: 13px; padding: 6px 0; text-align: right; font-weight: 600;">${amount.toLocaleString("ru-RU")} &#8381;</td>
          </tr>
          <tr>
            <td style="color: #6a6a7a; font-size: 13px; padding: 6px 0;">Статус</td>
            <td style="color: #10b981; font-size: 13px; padding: 6px 0; text-align: right; font-weight: 600;">Активна</td>
          </tr>
        </table>
      </div>
      <div style="text-align: center;">
        <a href="${APP_URL}/dashboard"
           style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Начать работу с агентами
        </a>
      </div>
    `),
  })
}
