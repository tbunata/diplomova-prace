import 'reflect-metadata'
import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from 'type-graphql'
import { Order } from '../types/Orders'
import * as OrderService from '../services/Orders'
import { Context } from '../auth/auth-checker'

@Resolver(Order)
export class OrderResolver {
    @Query(returns => [Order])
    async allOrders(
        @Arg('userId') userId: number
    ) {
        const orders = await OrderService.findAll(userId)
        return orders
    }

    // @Authorized()
    @Query(returns => Order, {nullable: true})
    async getOrder(
        @Ctx() ctx: Context,
        @Arg('id') id: number
    ) {
        return await OrderService.find(id, ctx.user!.id)
    }

    @Mutation(returns => Order)
    async updateOrderStatus(
        @Arg('id') id: number,
        @Arg('statusId') statusId: number
    ) {
        return await OrderService.updateStatus(id, statusId)
    }

    // @Authorized()
    @Mutation(returns => Boolean)
    async cancelOrder(
        @Arg('id') id: number
    ) {
        await OrderService.cancelOrder(id)
        return true
    }
}
