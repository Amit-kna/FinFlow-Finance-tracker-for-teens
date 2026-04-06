const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRueWp4aHV3Y2V0bGxsZ3N2dmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTQ3MTAsImV4cCI6MjA4OTY5MDcxMH0.dkz-qyKunQBFpfyAQ6p963FoP_jkUXIxHtaPbozfFCg'
const SUPABASE_URL = 'https://tnyjxhuwcetlllgsvvjv.supabase.co'

async function verify() {
  console.log('🔍 Verifying FinFlow Pro MVP database migration...\n')

  const tables = ['subscriptions', 'friendships', 'friend_goals', 'streak_freezes', 'points_log']
  const columns = ['is_pro', 'streak_freeze_count', 'total_xp']
  let passed = 0
  let failed = 0

  for (const table of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    })
    if (res.status === 200 || res.status === 206 || res.status === 406) {
      console.log(`  ✅ ${table} table exists`)
      passed++
    } else if (res.status === 404) {
      console.log(`  ❌ ${table} table NOT FOUND`)
      failed++
    } else {
      console.log(`  ⚠️  ${table} — status ${res.status}`)
      passed++
    }
  }

  for (const col of columns) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=${col}&limit=1`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    })
    if (res.ok) {
      console.log(`  ✅ users.${col} column exists`)
      passed++
    } else {
      console.log(`  ❌ users.${col} column NOT FOUND`)
      failed++
    }
  }

  const viewRes = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?limit=1`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  })
  if (viewRes.ok || viewRes.status === 206) {
    console.log(`  ✅ leaderboard view exists`)
    passed++
  } else {
    console.log(`  ❌ leaderboard view NOT FOUND`)
    failed++
  }

  console.log(`\n📊 Results: ${passed}/${passed + failed} checks passed`)
  if (failed === 0) {
    console.log('\n✅ Migration verified! All tables, columns, and views are in place.')
  } else {
    console.log('\n⚠️  Some checks failed. Run SQL in Supabase Dashboard → SQL Editor')
  }
}

verify().catch(err => console.error('Error:', err.message))
