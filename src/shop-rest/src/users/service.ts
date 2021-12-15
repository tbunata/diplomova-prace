import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'
import { BaseUser, User } from "./interface"

const prisma = new PrismaClient()


// todo implement filtering
export const findAll = async () => {
    const users = await prisma.user.findMany()
    return users
}

export const find = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    return user
}

export const findByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    return user
}

export const create = async (newUser: BaseUser) => {
    const encryptedPassword = await bcrypt.hash(newUser.password, 10)
    const user = await prisma.user.create({
        data: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: encryptedPassword,
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

export const update = async (id: number, userUpdate: User) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })

    if (!user) {
        return null
    }
    const encryptedPassword = await bcrypt.hash(userUpdate.password, 10)
    const updatedUser = prisma.user.update({
        where: {
            id: id
        },
        data: {
            firstName: userUpdate.firstName,
            lastName: userUpdate.lastName,
            email: userUpdate.email,
            password: encryptedPassword,
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

export const remove = async (id: number) => {
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

export const login = async (email: string, password:string) => {
    const user: User | null = await findByEmail(email)
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            { user_id: user.id, email},
            "process.env.TOKEN_KEY", // todo
            {
                expiresIn: "2h"
            }
        )
        user.token = token
        return user
    }

    return null
}