import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ProdiLogo } from "@/components/brand/prodi-logo"
import { Shield, Users, LayoutDashboard, ArrowLeft } from "lucide-react"

/**
 * Admin layout — SERVER-SIDE auth guard.
 *
 * SECURITY: Three-layer defence:
 *   1. This layout verifies the session AND calls is_admin() RPC
 *      before rendering any admin page. Non-admins are redirected.
 *   2. Every API route under /api/admin/* calls requireAdmin() again.
 *   3. Every admin_* SQL function re-checks is_admin() internally,
 *      so even a direct RPC call from a non-admin session is denied.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/admin")
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin")

  if (error || !isAdmin) {
    // Non-admin OR RPC error → silently redirect to dashboard.
    // We don't reveal that /admin exists.
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-gray-800/60 glass-strong sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 cursor-pointer">
              <ProdiLogo size={32} />
              <div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                    Admin
                  </span>
                </div>
                <span className="font-heading text-sm font-bold block leading-tight">
                  GetProdi
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                Обзор
              </Link>
              <Link
                href="/admin#users"
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Users className="h-4 w-4" />
                Пользователи
              </Link>
            </nav>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Выйти из админки
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
