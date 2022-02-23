import 'reflect-metadata'
import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from 'type-graphql'
import { Cart, NewCartItemInput, UpdateCartItemInput } from '../types/Carts'
import * as CartService from '../services/Carts'
import { Context } from '../auth/auth-checker'
import { Order } from '../types/Orders'

@Resolver(Cart)
export class CartResolver {
    @Query(returns => [Cart])
    async allCarts() {
        const carts = await CartService.findAll()
        return carts
    }

    @Query(returns => Cart, {nullable: true})
    async getCart(
        @Arg('userId') userId: number
    ) {
        return await CartService.find(userId)
    }

    @Mutation(returns => Cart)
    async addItemToCart(
        @Arg('userId') userId: number,
        @Arg('newCartItemData') newCartItemData: NewCartItemInput
    ) {
        return await CartService.addItem(userId, newCartItemData)
    }

    @Mutation(returns => Cart)
    async updateCartItem(
        @Arg('userId') userId: number,
        @Arg('updateCartItemData') updateCartItemData: UpdateCartItemInput
    ) {
        return await CartService.updateItem(userId, updateCartItemData)
    }

    @Mutation(returns => Cart)
    async clearCart(
        @Arg('userId') userId: number
    ) {
        const emptyCart = await CartService.clearCart(userId)
        return emptyCart
    }

    @Mutation(returns => Order)
    async checkoutCart(
        @Arg('userId') userId: number
    ) {
        const order = await CartService.checkoutCart(userId)
        return order
    }
}
