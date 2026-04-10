const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function checkColumns() {
    const pool = new Pool({ connectionString });
    try {
        console.log("Connecting to database...");
        const client = await pool.connect();

        const tables = ['job_cards', 'service_tasks', 'service_staff', 'service_requisitions'];

        for (const table of tables) {
            console.log(`\n--- Columns in ${table} ---`);
            const res = await client.query(`
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = '${table}'
                AND table_schema = 'public'
            `);
            if (res.rows.length === 0) {
                console.log(`Table ${table} not found or no columns.`);
            } else {
                res.rows.forEach(row => {
                    console.log(`- ${row.column_name} (${row.data_type})`);
                });
            }
        }

        client.release();
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

checkColumns();
