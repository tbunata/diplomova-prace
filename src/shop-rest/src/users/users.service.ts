import { PrismaClient } from '@prisma/client'
import { BaseUser, User } from "./user.interface"

const prisma = new PrismaClient()


// todo implement filtering
export const findAll = async (): Promise<User[]> => {
    const users = await prisma.user.findMany()
    return users
}

export const find = async (id: number): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    return user
}

export const create = async (newUser: BaseUser): Promise<User> => {
    const user = await prisma.user.create({
        data: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: newUser.password,
            phone: newUser.phone ? newUser.phone : null,
            address: newUser.address ? newUser.address : null,
            city: newUser.city ? newUser.city : null,
            zipCode: newUser.zipCode ? newUser.zipCode : null,
            status: {
                connect: {id: 1}
            }
        }
    })
    return user
}

export const update = async (id: number, userUpdate: User): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })

    if (!user) {
        return null
    }

    const updatedUser = prisma.user.update({
        where: {
            id: id
        },
        data: {
            firstName: userUpdate.firstName,
            lastName: userUpdate.lastName,
            email: userUpdate.email,
            password: userUpdate.password,
            phone: userUpdate.phone ? userUpdate.phone : null,
            address: userUpdate.address ? userUpdate.address : null,
            city: userUpdate.city ? userUpdate.city : null,
            zipCode: userUpdate.zipCode ? userUpdate.zipCode : null,
            status: {
                connect: {id: userUpdate.statusId}
            }
        }
    })
    return updatedUser
}

export const remove = async (id: number):Promise<null | void> => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })

    if (!user) {
        return null
    }

    await prisma.user.delete({
        where: {
            id:id
        }
    })
}