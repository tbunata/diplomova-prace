import 'reflect-metadata'
import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from 'type-graphql'
import { Order } from '../types/Orders'
import * as OrderService from '../services/Orders'
import { Context } from '../auth/auth-checker'

@Resolver(Order)
export class OrderResolver {
    @Authorized()
    @Query(returns => [Order])
    async allOrders(
        @Ctx() ctx: Context,
    ) {
        const orders = await OrderService.findAll(ctx.user!.id)
        return orders
    }

    @Authorized()
    @Query(returns => Order, {nullable: true})
    async getOrder(
        @Ctx() ctx: Context,
        @Arg('id') id: number
    ) {
        return await OrderService.find(id, ctx.user!.id)
    }

    @Authorized()
    @Mutation(returns => Order)
    async updateOrderStatus(
        @Arg('id') id: number,
        @Arg('statusId') statusId: number,
        @Ctx() ctx: Context
    ) {
        return await OrderService.updateStatus(id, statusId, ctx.user!.id)
    }

    @Authorized()
    @Mutation(returns => Boolean)
    async cancelOrder(
        @Arg('id') id: number,
        @Ctx() ctx: Context
    ) {
        await OrderService.cancelOrder(id, ctx.user!.id)
        return true
    }
}
