import { PrismaClient } from '@prisma/client'

async function verify() {
  const prisma = new PrismaClient()
  try {
    console.log('--- Database Verification ---')
    
    // Core tables to check
    const tables = ['dealers', 'profiles', 'job_cards', 'roles', 'service_invoices', 'job_state_history', 'qc_checklist_items']
    
    for (const table of tables) {
      try {
        const count = await (prisma as any)[table].count()
        console.log(`[OK] Table ${table} exists. Rows: ${count}`)
      } catch (err: any) {
        console.log(`[FAIL] Table ${table} check failed: ${err.message}`)
      }
    }
    
    console.log('--- End ---')
  } catch (e: any) {
    console.error('Fatal error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

verify().catch(console.error)