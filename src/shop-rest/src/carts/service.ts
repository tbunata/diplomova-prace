import { PrismaClient } from '@prisma/client'
import { BaseCartItem, CartItem } from "./interface"
import { UnprocessableEntityError, NotFoundError } from '../helper/errors'

const prisma = new PrismaClient()


export const detail = async(userId: number) => {
    let cart:any = await prisma.cart.findUnique({
        where: {
            userId: userId
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            description: true,
                            price: true
                        }
                    }
                }
            }
        }
    })
    if (!cart) {
        throw new NotFoundError(`Cart for user: ${userId} not found`)
    }
    let totalPrice = 0
    cart.items.forEach((item:CartItem) => {      
        totalPrice += item.product.price * item.quantity
    });

    cart = {
        ...cart,
        totalPrice: totalPrice
    }
    return cart
}

export const addItem = async (userId: number, cartItem: BaseCartItem) => {
    let cart = await prisma.cart.findUnique({
        where: {
            userId: userId
        }
    })
    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                userId: userId,
            }
        })
    }
    const newItem = await prisma.cartItem.upsert({
        where: {
            productId_cartId: {
                productId: cartItem.productId,
                cartId: cart.id
            }
        },
        update: {
            quantity: {
                increment: cartItem.quantity
            }
        },
        create: {
            productId: cartItem.productId,
            cartId: cart.id,
            quantity: cartItem.quantity
        }
    })
    return newItem
}

export const updateItem = async (userId: number, cartItem: BaseCartItem) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId: userId
        }
    })
    if(!cart) {
        throw new NotFoundError(`Cart for user: ${userId} not found`)
    }
    if (cartItem.quantity === 0) {
        await prisma.cartItem.delete({
            where: {
                productId_cartId: {
                    cartId: cart.id,
                    productId: cartItem.productId
                }
            }
        })
        return {message: "Item removed from cart"}
    } else {
        const updatedItem = await prisma.cartItem.update({
            where: {
                productId_cartId: {
                    cartId: cart.id,
                    productId: cartItem.productId
                }
            },
            data: {
                quantity: cartItem.quantity
            }
        })
        return updatedItem
    }

}


export const clearCart = async(userId: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId: userId
        }
    })
    if(!cart) {
        throw new NotFoundError(`Cart for user: ${userId} not found`)
    }
    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id
        }
    })
    return null
}

export const checkoutCart = async (userId: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId: userId
        },
        include: {
            items: {
                include: {
                    product: {}
                }
            }
        }
    })
    if(!cart) {
        throw new NotFoundError(`Cart for user: ${userId} not found`)
    } else if (cart.items.length === 0) {
        throw new UnprocessableEntityError(`Cart: ${cart.id} is empty`)
    }
    const order = await prisma.$transaction(async (prisma) => {
        let totalPrice = 0
        const orderItems = cart.items.map((item) => {
            totalPrice += item.product.price * item.quantity
            return {
                productId: item.productId,
                price: item.product.price,
                quantity: item.quantity
            }
        })
    
        const newOrder = await prisma.order.create({
            data: {
                price: totalPrice,
                orderStatusId: 1,
                userId: userId,
                orderItems: {
                    createMany: {
                        data: orderItems
                    }
                }
            }
        })

        await Promise.all(cart.items.map(async (item) => {
            if (item.quantity > item.product.quantity) {
                throw new UnprocessableEntityError(`Item: ${item.id} named ${item.product.name} sold out`)
            }
            await prisma.product.update({
                where: {
                    id: item.productId
                },
                data: {
                    quantity: {
                        decrement: item.quantity
                    }
                }
            })
        }))
        await clearCart(userId)
        return newOrder
    }).catch((e) => {
        throw e
    }).finally(() =>
        prisma.$disconnect()
    )
    return order
}