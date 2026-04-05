/**
 * Lightweight server-side event tracking via usage_events table.
 * Non-blocking: errors are logged, never thrown.
 */
import { SupabaseClient } from "@supabase/supabase-js"

export type FunnelEvent =
  | "register"
  | "onboarding_complete"
  | "pricing_viewed"
  | "checkout_clicked"
  | "payment_succeeded"
  | "agent_message_sent"
  | "artifact_saved"
  | "free_unpacker_started"

export async function trackEvent(
  supabase: SupabaseClient,
  event: FunnelEvent,
  metadata: Record<string, string | number | boolean> = {},
  workspaceId?: string
) {
  try {
    await supabase.from("usage_events").insert({
      workspace_id: workspaceId || null,
      event_type: event,
      metadata,
    })
  } catch (err) {
    console.error(`Track event "${event}" failed:`, err)
  }
}
