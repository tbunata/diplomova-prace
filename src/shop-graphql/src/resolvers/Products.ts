import 'reflect-metadata'
import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from 'type-graphql'
import { NewProductInput, Product, UpdateProductInput } from '../types/Products'
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
        @Arg('updateProductData') updateProductData: UpdateProductInput
    ) {
        return await ProductService.update(id, updateProductData)
    }

    @Mutation(returns => Boolean)
    async removeProduct(
        @Arg('id') id: number,
    ) {
        await ProductService.remove(id)
        return true
    }
}