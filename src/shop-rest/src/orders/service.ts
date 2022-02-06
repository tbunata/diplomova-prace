import { PrismaClient } from '@prisma/client'
import { NotFoundError, UnauthorizedError, UnprocessableEntityError } from '../helper/errors'

const prisma = new PrismaClient()


const includeRelated = {
    status: true,
    orderItems: {
        select: {
            productId: true,
            quantity: true,
            product: {
                select: {
                    name: true,
                }
            }
        }
    }
}

export const findAll = async (userId: number) => {
    const orders = await prisma.order.findMany({
        where: {
            userId: userId
        },
        include: includeRelated
    })
    return orders
}

export const find = async (id: number, userId: number) => {
    const order = await prisma.order.findUnique({
        where: {
            id: id
        },
        include: includeRelated
    })
    if (!order) {
        throw new NotFoundError(`Order with id: ${id} not found`)
    } else if (order.userId != userId) {
        throw new UnauthorizedError(`Unauthorized to view order with id: ${id}`)
    }
    return order
}

export const updateStatus = async (id: number, status: number) => {
    const order = await prisma.order.findUnique({
        where: {
            id: id
        }
    })

    if (!order) {
        throw new NotFoundError(`Order with id: ${id} not found`)
    }
    const updatedOrder = await prisma.order.update({
        where: {
            id: id
        },
        data: {
            orderStatusId: status
        },
        include: includeRelated
    })
    return updatedOrder
}


export const cancelOrder = async (id: number) => {
    const order = await prisma.order.findUnique({
        where: {
            id: id
        },
        include: includeRelated
    })

    if (!order) {
        throw new NotFoundError(`Order with id: ${id} not found`)
    } else if (order.status.id == 5) {
        throw new UnprocessableEntityError(`Order with id: ${id} is already cancelled`)
    }

    await prisma.$transaction(async (prisma) => {
        const orderItems = order.orderItems.map((item) => {
            return {
                productId: item.productId,
                quantity: item.quantity
            }
        })

        await Promise.all(orderItems.map(async (item) => {
            await prisma.product.update({
                where: {
                    id: item.productId
                },
                data: {
                    quantity: {
                        increment: item.quantity
                    }
                }
            })
        }))
        await prisma.order.update({
            where: {
                id: id
            },
            data: {
                orderStatusId: 5
            }
        })
    }).catch((e) => {
        throw e
    }).finally(() =>
        prisma.$disconnect()
    )
}
