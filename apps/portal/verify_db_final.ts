const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { prisma } = require('./src/lib/prisma/client');

async function verify() {
  try {
    console.log('--- Database Verification ---');
    console.log('DB URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not Loaded');
    
    // Core tables to check
    const tables = ['dealers', 'profiles', 'job_cards', 'roles', 'service_invoices', 'job_state_history', 'qc_checklist_items'];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`[OK] Table ${table} exists. Rows: ${count}`);
      } catch (err) {
        console.log(`[FAIL] Table ${table} check failed: ${err.message}`);
      }
    }
    
    console.log('--- End ---');
  } catch (e) {
    console.error('Fatal error:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

verify();