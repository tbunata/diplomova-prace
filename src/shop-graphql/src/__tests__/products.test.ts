import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from '../app'
import { Server } from 'http'

import { brands } from '../../prisma/seeds/brands'
import { categories } from '../../prisma/seeds/categories'
import { productStatuses } from '../../prisma/seeds/productStatuses'
import { products } from '../../prisma/seeds/products'
import { productCategories } from '../../prisma/seeds/productCategories'


const prisma = new PrismaClient()
let server: Server

beforeAll(async () => {
    await prisma.brand.createMany({
        data: brands
    })
    await prisma.category.createMany({
        data: categories
    })
    await prisma.productStatus.createMany({
        data: productStatuses
    })
    await prisma.$transaction([
        prisma.product.createMany({
            data: products
        }),
        prisma.productCategory.createMany({
            data: productCategories
        })
    ])
    server = await createApp({port:0})
})


describe('QUERY allProducts', () => {
    it('should get a list of products', async () => {
        const queryData = {
            query: '{ allProducts { id, name } }',
        }
        const response = await request(server)
            .post('/graphql')
            .send(queryData)
        console.log(response.text)

    })
})