import { PrismaClient } from '@prisma/client'

import { userStatuses } from './seeds/userStatuses'
import { users } from './seeds/users'
import { brands } from './seeds/brands'
import { categories } from './seeds/categories'
import { productStatuses } from './seeds/productStatuses'
import { products } from './seeds/products'

const prisma = new PrismaClient()



async function main() {
    await prisma.userStatus.createMany({
        data: userStatuses
    })
    await prisma.user.createMany({
        data: users
    })
    await prisma.brand.createMany({
        data: brands
    })
    await prisma.category.createMany({
        data: categories
    })
    await prisma.productStatus.createMany({
        data: productStatuses
    })
    await prisma.product.createMany({
        data: products
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