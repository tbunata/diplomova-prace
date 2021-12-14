import { PrismaClient } from '@prisma/client'

import { userStatuses } from './seeds/userStatuses'
import { users } from './seeds/users'

const prisma = new PrismaClient()



async function main() {
    await prisma.userStatus.createMany({
        data: userStatuses
    })
    await prisma.user.createMany({
        data: users
    })
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
});