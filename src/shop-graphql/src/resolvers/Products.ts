import 'reflect-metadata'
import { Resolver, Mutation, Arg, Args, Query, Authorized, Ctx, Subscription, Root, PubSub, PubSubEngine } from 'type-graphql'
import { NewProductInput, Product, ProductFilterInput, QuantityUpdateArgs, UpdateProductInput } from '../types/Products'
import * as ProductService from '../services/Products'
import { Context } from '../auth/auth-checker'


@Resolver(Product)
export class ProductResolver {
    @Authorized()
    @Query(returns => [Product])
    async allProducts(
        @Arg('productFilterData', {nullable: true}) productFilterData: ProductFilterInput
    ) {
        const products = await ProductService.findAll(productFilterData)
        return products
    }

    @Authorized()
    @Query(returns => Product)
    async getProduct(
        @Arg('id') id: number
    ) {
        const product = await ProductService.find(id)
        return product
    }

    @Authorized()
    @Mutation(returns => Product)
    async addProduct(
        @Arg('newProductData') newProductData: NewProductInput
    ) {
        return await ProductService.create(newProductData)
    }

    @Authorized()
    @Mutation(returns => Product)
    async updateProduct(
        @Arg('id') id: number,
        @Arg('updateProductData') updateProductData: UpdateProductInput,
        @PubSub() pubSub: PubSubEngine
    ) {
        const updatedProduct = await ProductService.update(id, updateProductData)
        await pubSub.publish('PRODUCT', updatedProduct)
        return updatedProduct
    }

    @Authorized()
    @Mutation(returns => Boolean)
    async removeProduct(
        @Arg('id') id: number,
    ) {
        await ProductService.remove(id)
        return true
    }

    @Authorized()
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