import * as UserService from "../users/service"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.userStatus.createMany({
        data: [{name: "created"}, {name: "approved"}]
    })
})

afterAll(async () => {
    const deleteUsers = prisma.user.deleteMany()
    const deleteUserStatus = prisma.userStatus.deleteMany()

    await prisma.$transaction([
        deleteUsers,
        deleteUserStatus
    ])

    await prisma.$disconnect()
})

it('should create 1 new user', async () => {
    const user = {
        firstName: "Havelock",
        lastName: "Vetinari",
        email: "lord.vetinari@ankh-morpork.dw",
        password: "vetinariho"
    }

    const createdUser = await UserService.create(user)

    const dbUser = await UserService.find(createdUser.id)
    expect(createdUser.firstName).toEqual(user.firstName)

})