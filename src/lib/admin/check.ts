import { createClient } from "@/lib/supabase/server"

/**
 * Checks if the current authenticated user is an admin.
 * Returns `{ ok: true, user, supabase }` on success, or `{ ok: false, status, error }`.
 *
 * SECURITY: Three-layer check:
 *   1. Valid Supabase session (auth.getUser)
 *   2. DB `is_admin()` RPC (SECURITY DEFINER, reads admin_users whitelist)
 *   3. All admin RPC functions internally re-verify via is_admin()
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, status: 401, error: "Unauthorized" }
  }

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin")

  if (rpcError) {
    console.error("is_admin RPC error:", rpcError)
    return { ok: false as const, status: 500, error: "Admin check failed" }
  }

  if (!isAdmin) {
    return { ok: false as const, status: 403, error: "Forbidden" }
  }

  return { ok: true as const, user, supabase }
}
