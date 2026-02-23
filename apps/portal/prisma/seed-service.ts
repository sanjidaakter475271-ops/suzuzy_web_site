import 'dotenv/config';
import { prisma } from '../src/lib/prisma/client';


async function main() {
    console.log('Starting seed...');

    const dealerId = '4d195f26-0aa2-4520-bd57-882d987bab10'; // Suzuki Flagship Store

    // 1. Seed bike_models
    const bikeModelsData = [
        { name: 'Suzuki Gixxer SF 150', cc: '155', engine_type: 'Single Cylinder', brand: 'Suzuki', code: 'GSX150' },
        { name: 'Suzuki Gixxer 150', cc: '155', engine_type: 'Single Cylinder', brand: 'Suzuki', code: 'GX150' },
        { name: 'Suzuki Hayabusa', cc: '1340', engine_type: '4-Cylinder', brand: 'Suzuki', code: 'GSX1300R' },
        { name: 'Suzuki Access 125', cc: '124', engine_type: 'Single Cylinder', brand: 'Suzuki', code: 'AC125' },
        { name: 'Suzuki Burgman Street', cc: '124', engine_type: 'Single Cylinder', brand: 'Suzuki', code: 'BS125' },
        { name: 'Suzuki V-Strom SX', cc: '249', engine_type: 'Single Cylinder', brand: 'Suzuki', code: 'DS250' },
        { name: 'Suzuki Katana', cc: '999', engine_type: '4-Cylinder', brand: 'Suzuki', code: 'GSX-S1000' },
        { name: 'Suzuki GSX-R150', cc: '147', engine_type: 'Single Cylinder', brand: 'Suzuki', code: 'GSXR150' },
    ];

    for (const model of bikeModelsData) {
        await prisma.bike_models.upsert({
            where: { name: model.name },
            update: {},
            create: model,
        });
    }
    const bikeModels = await prisma.bike_models.findMany();
    console.log(`Seeded ${bikeModels.length} bike models.`);

    // 2. Seed service_staff
    // Using some existing profiles or just mock names
    const staffProfiles = [
        { id: '34773372-a603-4825-8e00-68f8548abdc5', name: 'John Tech', staff_id: 'TECH-001' },
        { id: '046cc0a6-80c7-474a-ab7e-0628434920b2', name: 'Mike Repair', staff_id: 'TECH-002' },
    ];

    for (const staff of staffProfiles) {
        await prisma.service_staff.upsert({
            where: { staff_id: staff.staff_id },
            update: { profile_id: staff.id },
            create: {
                name: staff.name,
                staff_id: staff.staff_id,
                profile_id: staff.id,
                designation: 'Technician',
                is_active: true,
            },
        });
    }
    // Add 3 more without real profile_id just for volume
    for (let i = 3; i <= 5; i++) {
        await prisma.service_staff.upsert({
            where: { staff_id: `TECH-00${i}` },
            update: {},
            create: {
                name: `Technician ${i}`,
                staff_id: `TECH-00${i}`,
                designation: 'Technician',
                is_active: true,
            },
        });
    }
    const staff = await prisma.service_staff.findMany();
    console.log(`Seeded ${staff.length} service staff.`);

    // 3. Seed service_ramps
    for (let i = 1; i <= 6; i++) {
        const status = i <= 2 ? 'busy' : i <= 4 ? 'idle' : 'offline';
        await prisma.service_ramps.upsert({
            where: { ramp_number: i },
            update: { status },
            create: {
                ramp_number: i,
                status: status,
                staff_id: status === 'busy' ? staff[i - 1].id : null,
            },
        });
    }
    const ramps = await prisma.service_ramps.findMany();
    console.log(`Seeded ${ramps.length} service ramps.`);

    // 4. Seed parts (into parts table)
    const partsData = [
        { name: 'Engine Oil 1L', code: 'OIL-001' },
        { name: 'Oil Filter', code: 'FLT-001' },
        { name: 'Brake Pad Front', code: 'BRK-001' },
        { name: 'Brake Pad Rear', code: 'BRK-002' },
        { name: 'Air Filter', code: 'AIR-001' },
        { name: 'Spark Plug', code: 'SPK-001' },
        { name: 'Drive Chain Set', code: 'CHN-001' },
        { name: 'Tire Front', code: 'TIR-001' },
        { name: 'Tire Rear', code: 'TIR-002' },
        { name: 'Battery', code: 'BAT-001' },
    ];
    for (const part of partsData) {
        await prisma.parts.upsert({
            where: { code: part.code },
            update: {},
            create: part,
        });
    }
    const allParts = await prisma.parts.findMany();
    console.log(`Seeded ${allParts.length} parts.`);

    // 5. Seed products (for requisitions)
    // We need products linked to dealer
    for (const part of partsData) {
        await prisma.products.upsert({
            where: { slug: part.name.toLowerCase().replace(/ /g, '-') },
            update: {},
            create: {
                name: part.name,
                slug: part.name.toLowerCase().replace(/ /g, '-'),
                sku: part.code,
                dealer_id: dealerId,
                brand: 'Suzuki',
                base_price: 500,
                status: 'active',
            },
        });
    }
    const products = await prisma.products.findMany({ where: { dealer_id: dealerId } });
    console.log(`Seeded ${products.length} products for dealer.`);

    // 6. Seed service_vehicles
    const customerId = '25f0aabc-4a3d-4bd0-8d59-a422faefcdab'; // dealer@gmail.com for testing
    for (let i = 1; i <= 10; i++) {
        await prisma.service_vehicles.upsert({
            where: { engine_number: `ENG-${1000 + i}` },
            update: {},
            create: {
                engine_number: `ENG-${1000 + i}`,
                chassis_number: `CHS-${1000 + i}`,
                phone_number: `0171100000${i % 10}`,
                customer_name: `Customer ${i}`,
                customer_id: customerId,
                model_id: bikeModels[i % bikeModels.length].id,
            },
        });
    }
    const vehicles = await prisma.service_vehicles.findMany();
    console.log(`Seeded ${vehicles.length} service vehicles.`);

    // 7. Seed service_tickets
    const statuses = ['waiting', 'in_progress', 'completed', 'finalized'];
    for (let i = 1; i <= 15; i++) {
        const status = statuses[i % statuses.length];
        const ramp = status === 'in_progress' ? ramps.find((r: any) => r.status === 'busy') : null;
        await prisma.service_tickets.upsert({
            where: { service_number: `SRV-${2024000 + i}` },
            update: {},
            create: {
                service_number: `SRV-${2024000 + i}`,
                vehicle_id: vehicles[i % vehicles.length].id,
                customer_id: customerId,
                status: status,
                ramp_id: ramp?.id || null,
                staff_id: staff[i % staff.length].id,
                service_description: `Periodic maintenance and checkup ${i}`,
                finalized_at: status === 'finalized' ? new Date() : null,
            },
        });
    }
    const tickets = await prisma.service_tickets.findMany();
    console.log(`Seeded ${tickets.length} service tickets.`);

    // 8. Seed job_cards
    for (let i = 0; i < 12; i++) {
        const ticket = tickets[i];
        await prisma.job_cards.create({
            data: {
                ticket_id: ticket.id,
                technician_id: staff[i % staff.length].id,
                status: ticket.status === 'in_progress' ? 'in_progress' : 'completed',
                service_start_time: new Date(Date.now() - 3600000), // 1 hour ago
                service_end_time: ticket.status === 'completed' || ticket.status === 'finalized' ? new Date() : null,
            },
        });
    }
    console.log(`Seeded ${12} job cards.`);

    // 9. Seed service_requisitions
    for (let i = 0; i < 20; i++) {
        const ticket = tickets[i % tickets.length];
        const product = products[i % products.length];
        await prisma.service_requisitions.create({
            data: {
                ticket_id: ticket.id,
                staff_id: staff[i % staff.length].id,
                product_id: product.id,
                quantity: 1,
                unit_price: 500 + (i * 10),
                total_price: 500 + (i * 10),
                status: 'approved',
            },
        });
    }
    console.log(`Seeded ${20} service requisitions.`);

    // 10. Seed expense_categories
    const expenseCats = [
        { name: 'Utilities', description: 'Electricity, Water, internet' },
        { name: 'Maintenance', description: 'Equipment maintenance' },
        { name: 'Supplies', description: 'Workshop supplies' },
        { name: 'Salaries', description: 'Staff salaries' },
    ];
    for (const cat of expenseCats) {
        const existing = await prisma.expense_categories.findFirst({ where: { name: cat.name } });
        if (!existing) {
            await prisma.expense_categories.create({ data: cat });
        }
    }
    const allExpenseCats = await prisma.expense_categories.findMany();
    console.log(`Seeded ${allExpenseCats.length} expense categories.`);

    // 11. Seed expenses
    for (let i = 1; i <= 8; i++) {
        await prisma.expenses.upsert({
            where: {
                dealer_id_expense_number: {
                    dealer_id: dealerId,
                    expense_number: `EXP-${2024000 + i}`,
                },
            },
            update: {},
            create: {
                expense_number: `EXP-${2024000 + i}`,
                dealer_id: dealerId,
                category_id: allExpenseCats[i % allExpenseCats.length].id,
                title: `Expense ${i}`,
                amount: 1000 + (i * 500),
                payment_method: 'Cash',
                status: 'paid',
                expense_date: new Date(),
            },
        });
    }
    console.log(`Seeded 8 expenses.`);

    // 12. Seed transactions
    for (let i = 1; i <= 10; i++) {
        await prisma.transactions.create({
            data: {
                type: i % 2 === 0 ? 'income' : 'expense',
                amount: 2000 + (i * 100),
                status: 'completed',
                dealer_id: dealerId,
                user_id: customerId,
                reference_type: 'service',
                created_at: new Date(),
            },
        });
    }
    console.log(`Seeded 10 transactions.`);

    console.log('Seed finished successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
