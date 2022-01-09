import { brands } from "../../prisma/seeds/brands"
import { categories } from "../../prisma/seeds/categories"
import { productStatuses } from "../../prisma/seeds/productStatuses"
import { products } from "../../prisma/seeds/products";
import { productCategories } from "../../prisma/seeds/productCategories";

import {app} from "../app"
import supertest from "supertest";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
    console.log("Products beforeAll")
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

})


afterAll(async () => {
    console.log("Products afterAll")
    const deleteBrands = prisma.brand.deleteMany()
    const deleteCategories = prisma.category.deleteMany()
    const deleteProductStatuses = prisma.productStatus.deleteMany()
    const deleteProducts = prisma.product.deleteMany()
    const deleteProductCategories = prisma.productCategory.deleteMany()


    await prisma.$transaction([
        deleteProductCategories,
        deleteProducts,
        deleteBrands,
        deleteCategories,
        deleteProductStatuses,
    ])
})

describe("GET /products", () => {
    it("should get a list of products", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/products")
            .send({token: loginResponse.body.token})
            .expect(200)
            .then(async (res) => {
                expect(res.body.length).toBe(2)
                expect(res.body[0].name).toBe("Burnished-Leather Jacket")
                expect(res.body[1].name).toBe("Striped Cotton-Blend Socks")
            })
    })
})