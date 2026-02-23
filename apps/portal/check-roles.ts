
import { prisma } from './src/lib/prisma/client';

async function main() {
    const roles = await prisma.roles.findMany();
    console.log(JSON.stringify(roles, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
