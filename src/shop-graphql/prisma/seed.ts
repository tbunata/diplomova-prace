import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()



async function main() {
    await prisma.user.create({
        data: {
            name: 'Tomas Bunata',
            email: 'tom.bunata@gmail.com'
        }
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })