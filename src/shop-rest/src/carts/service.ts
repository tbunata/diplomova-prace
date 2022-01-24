import { PrismaClient } from '@prisma/client'
import { BaseCartItem, CartItem } from "./interface"

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
        return null
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
        return null
    }
    await prisma.cartItem.deleteMany({
        where: {
            cartId: cart.id
        }
    })
    return null
}