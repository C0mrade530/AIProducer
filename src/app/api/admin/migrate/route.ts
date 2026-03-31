import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * ADMIN ENDPOINT: Apply database migrations
 *
 * This endpoint applies pending migrations to the database.
 * For security, it should only be called once and then removed.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is authenticated (basic security)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    // Migration 001: Add tracker settings to profiles
    // Since we can't execute raw DDL with anon key, we'll check if columns exist
    // by trying to query them, and if not - inform user to run migration manually

    const { data, error } = await supabase
      .from("profiles")
      .select("tracker_motivation, tracker_daily_fact")
      .limit(1)
      .single()

    if (error) {
      if (error.message.includes("column") && error.message.includes("does not exist")) {
        return new Response(
          JSON.stringify({
            status: "pending",
            message: "Migration not applied. Please run SQL in Supabase Dashboard:",
            sql: `
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tracker_motivation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracker_daily_fact BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.tracker_motivation IS 'Enable Telegram motivation messages from Tracker agent';
COMMENT ON COLUMN profiles.tracker_daily_fact IS 'Enable daily fact/quote from business books';
            `,
            dashboard_url: "https://supabase.com/dashboard/project/mwtisbekfotdkemehdzy/sql/new"
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        )
      }
      throw error
    }

    return new Response(
      JSON.stringify({
        status: "completed",
        message: "Migration already applied. Columns exist.",
        columns: Object.keys(data || {})
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Migration check failed",
        details: String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
