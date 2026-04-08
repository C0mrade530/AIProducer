import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/check"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 })
  }

  const check = await requireAdmin()
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  const [userRes, chatsRes, artifactsRes] = await Promise.all([
    check.supabase.rpc("admin_get_user", { p_user_id: id }),
    check.supabase.rpc("admin_get_user_chats", { p_user_id: id }),
    check.supabase.rpc("admin_get_user_artifacts", { p_user_id: id }),
  ])

  if (userRes.error) {
    return NextResponse.json({ error: userRes.error.message }, { status: 500 })
  }

  return NextResponse.json({
    user: userRes.data,
    chats: chatsRes.data || [],
    artifacts: artifactsRes.data || [],
  })
}
