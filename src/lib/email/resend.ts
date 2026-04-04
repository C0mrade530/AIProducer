import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #7C3AED; border-radius: 12px; padding: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 24px;">✦</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; color: #1E1B4B; margin: 0;">GetProdi</h1>
        </div>
        <h2 style="font-size: 20px; color: #1E1B4B;">Привет, ${name}!</h2>
        <p style="color: #64748B; line-height: 1.6;">
          Рады видеть тебя в GetProdi. Теперь у тебя есть доступ к 7 AI-агентам,
          которые помогут создать и продать твой онлайн-продукт.
        </p>
        <p style="color: #64748B; line-height: 1.6;">
          <strong>Начни с Распаковщика</strong> — он поможет раскрыть твою экспертность
          и понять, как тебя позиционировать на рынке.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: #7C3AED; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Перейти в Dashboard
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 13px; text-align: center;">
          &copy; GetProdi ${new Date().getFullYear()}
        </p>
      </div>
    `,
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
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #7C3AED; border-radius: 12px; padding: 12px; margin-bottom: 16px;">
            <span style="color: white; font-size: 24px;">✦</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; color: #1E1B4B; margin: 0;">GetProdi</h1>
        </div>
        <h2 style="font-size: 20px; color: #1E1B4B;">Оплата прошла успешно!</h2>
        <p style="color: #64748B; line-height: 1.6;">
          ${name}, твоя подписка <strong>${planLabels[plan] || plan}</strong> активирована.
        </p>
        <div style="background: #F5F3FF; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; color: #1E1B4B;">
            <strong>Тариф:</strong> ${planLabels[plan] || plan}<br/>
            <strong>Сумма:</strong> ${amount} ₽<br/>
            <strong>Статус:</strong> Активна
          </p>
        </div>
        <p style="color: #94A3B8; font-size: 13px; text-align: center;">
          &copy; GetProdi ${new Date().getFullYear()}
        </p>
      </div>
    `,
  })
}
