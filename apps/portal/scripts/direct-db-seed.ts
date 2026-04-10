
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the root or current dir
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
});

async function main() {
    console.log('Connecting to database using direct link...');
    try {
        await client.connect();
        console.log('Connected successfully.');

        // 1. Get a Dealer
        const dealerRes = await client.query('SELECT id FROM dealers LIMIT 1');
        let dealer_id = dealerRes.rows[0]?.id;
        
        if (!dealer_id) {
            dealer_id = uuidv4();
            await client.query(
                'INSERT INTO dealers (id, business_name, slug, email, phone, status) VALUES ($1, $2, $3, $4, $5, $6)',
                [dealer_id, 'Suzuki Main Showroom', 'suzuki-main-' + Date.now(), 'info@suzuki.com', '01700000000', 'active']
            );
            console.log('Created default dealer.');
        } else {
            console.log(`Using existing dealer: ${dealer_id}`);
        }

        // 2. Create 14 Suzuki Models in bike_models
        const suzukiModels = [
            'Gixxer SF', 'Gixxer Monotone', 'GSX-R150', 'Hayabusa', 'V-Strom SX', 
            'Burgman Street', 'Access 125', 'Avenis 125', 'Intruder', 'GSX-S150',
            'Gixxer 250', 'Gixxer SF 250', 'V-Strom 650', 'Katana'
        ];
        
        const modelIds: string[] = [];
        for (const name of suzukiModels) {
            const id = uuidv4();
            const res = await client.query(
                'INSERT INTO bike_models (id, name, brand, cc, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
                [id, name, 'Suzuki', '150', true]
            );
            modelIds.push(res.rows[0].id);
        }
        console.log('Ensured 14 Suzuki bike models exist.');

        // 3. Create 10 Customers (Profiles) and 14 Vehicles
        const vehicleDistribution = [2, 2, 2, 2, 1, 1, 1, 1, 1, 1]; // Sum = 14
        let totalVehicles = 0;

        for (let i = 0; i < 10; i++) {
            const custId = uuidv4();
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const fullName = `${firstName} ${lastName}`;
            const phone = '01' + Math.floor(Math.random() * 900000000 + 100000000);
            const email = faker.internet.email({ firstName, lastName }).toLowerCase();
            
            await client.query(
                'INSERT INTO profiles (id, first_name, last_name, full_name, email, role, status, dealer_id, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [custId, firstName, lastName, fullName, email, 'customer', 'active', dealer_id, phone]
            );

            const vCount = vehicleDistribution[i];
            for (let j = 0; j < vCount; j++) {
                const vId = uuidv4();
                const modelId = modelIds[totalVehicles % modelIds.length];
                const eng = 'ENG' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
                const cha = 'CHA' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
                const reg = 'DHK-' + Math.floor(Math.random() * 90000 + 10000);

                await client.query(
                    'INSERT INTO service_vehicles (id, customer_id, model_id, engine_number, chassis_number, reg_no, phone_number, customer_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [vId, custId, modelId, eng, cha, reg, phone, fullName]
                );
                totalVehicles++;
            }
            console.log(`Customer ${i+1} added: ${fullName} (${vCount} vehicles)`);
        }

        console.log(`Seeding complete! 10 customers and ${totalVehicles} vehicles added.`);
    } catch (err) {
        console.error('Database Error:', err);
    } finally {
        await client.end();
    }
}

main();
