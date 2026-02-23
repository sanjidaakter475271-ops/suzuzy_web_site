import 'dotenv/config';
import { prisma } from '../src/lib/prisma/client';

async function main() {
    console.log('Testing profile lookup...');
    try {
        const start = Date.now();
        const user = await prisma.profiles.findFirst({
            where: { email: 'superadmin@gmail.com' },
            include: {
                roles: true,
            }
        });
        const end = Date.now();
        console.log('Query took:', end - start, 'ms');
        if (user) {
            console.log('User found:', user.email, 'Role:', (user.roles as any)?.name);
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error('Query failed:', err);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
