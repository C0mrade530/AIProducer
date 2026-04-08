import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/check"

export async function GET() {
  const check = await requireAdmin()
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const { data, error } = await check.supabase.rpc("admin_list_users")
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}
