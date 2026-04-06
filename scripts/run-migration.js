const SUPABASE_ACCESS_TOKEN = 'sbp_06546f9614b8d34affbb5021ab226474543f5f24'
const PROJECT_REF = 'tnyjxhuwcetlllgsvvjv'
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('🚀 Running FinFlow Pro MVP migration...\n')

  const sqlPath = path.join(__dirname, '..', 'supabase_pro_migration.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ query: sql })
    }
  )

  const result = await response.json()

  if (!response.ok) {
    console.error('❌ Migration failed:')
    console.error(JSON.stringify(result, null, 2))
    process.exit(1)
  }

  console.log('✅ Migration executed successfully!')
  console.log('\n📊 Results:')
  if (Array.isArray(result)) {
    result.forEach((r, i) => {
      if (r.error) {
        console.log(`  ⚠️  Statement ${i + 1}: ${r.error.message || r.error}`)
      } else {
        console.log(`  ✅ Statement ${i + 1}: OK`)
      }
    })
  }

  console.log('\n🔑 Next steps:')
  console.log('   1. Verify tables in Supabase Dashboard → Table Editor')
  console.log('   2. Test Pro activation at /admin/activate-pro')
  console.log('   3. Schedule reset_monthly_freezes() via pg_cron or Vercel cron')
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
