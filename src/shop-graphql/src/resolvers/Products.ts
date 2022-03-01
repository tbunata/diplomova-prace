import 'reflect-metadata'
import { Resolver, Mutation, Arg, Args, Query, Authorized, Ctx, Subscription, Root, PubSub, PubSubEngine } from 'type-graphql'
import { NewProductInput, Product, QuantityUpdateArgs, UpdateProductInput } from '../types/Products'
import * as ProductService from '../services/Products'
import { Context } from '../auth/auth-checker'


@Resolver(Product)
export class ProductResolver {
    @Query(returns => [Product])
    async allProducts() {
        const products = await ProductService.findAll([], null, null)// todo
        return products
    }

    @Query(returns => Product)
    async getProduct(
        @Arg('id') id: number
    ) {
        const product = await ProductService.find(id)
        return product
    }

    @Mutation(returns => Product)
    async addProduct(
        @Arg('newProductData') newProductData: NewProductInput
    ) {
        return await ProductService.create(newProductData)
    }

    @Mutation(returns => Product)
    async updateProduct(
        @Arg('id') id: number,
        @Arg('updateProductData') updateProductData: UpdateProductInput,
        @PubSub() pubSub: PubSubEngine
    ) {
        const updatedProduct = await ProductService.update(id, updateProductData)
        const payload = { quantity: updatedProduct.quantity }
        await pubSub.publish('PRODUCT', updatedProduct)
        return updatedProduct
    }

    @Mutation(returns => Boolean)
    async removeProduct(
        @Arg('id') id: number,
    ) {
        await ProductService.remove(id)
        return true
    }

    @Subscription({
        topics: 'PRODUCT',
        filter: ({payload, args}) => {
            return args.productIds.includes(payload.id)
        }
    })
    quantityUpdate(
        @Root() product: Product,
        @Args() args: QuantityUpdateArgs
    ): Product {
        return product
    }
}