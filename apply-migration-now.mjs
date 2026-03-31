import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mwtisbekfotdkemehdzy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dGlzYmVrZm90ZGtlbWVoZHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3NjgxOSwiZXhwIjoyMDkwNDUyODE5fQ.Yxlv0NfZJB7EfwMHP6xqLWDVxZvDsxowUmLe2cRvYoA'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🔄 Applying migration: add tracker settings to profiles...')

  try {
    // Execute raw SQL using service_role key
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS tracker_motivation BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS tracker_daily_fact BOOLEAN DEFAULT false;

        COMMENT ON COLUMN profiles.tracker_motivation IS 'Enable Telegram motivation messages from Tracker agent';
        COMMENT ON COLUMN profiles.tracker_daily_fact IS 'Enable daily fact/quote from business books';
      `
    })

    if (error) {
      // RPC might not exist, try alternative approach
      console.log('⚠️  RPC approach failed, trying direct query...')

      // Try using REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            ALTER TABLE profiles
            ADD COLUMN IF NOT EXISTS tracker_motivation BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS tracker_daily_fact BOOLEAN DEFAULT false;
          `
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
    }

    console.log('✅ Migration applied successfully!')

    // Verify columns exist
    const { data: profiles, error: verifyError } = await supabase
      .from('profiles')
      .select('tracker_motivation, tracker_daily_fact')
      .limit(1)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      console.log('✅ Verification: columns exist')
      console.log('   Available fields:', Object.keys(profiles[0] || {}))
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

applyMigration()
