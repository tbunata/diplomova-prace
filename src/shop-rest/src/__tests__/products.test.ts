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
    it("should get a filtered list of products", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/products")
            .send({token: loginResponse.body.token})
            .query({
                minPrice: "20",
                maxPrice: "100"})
            .expect(200)
            .then(async (res) => {
                expect(res.body.length).toBe(1)
                expect(res.body[0].name).toBe("Striped Cotton-Blend Socks")
            })
    })
})

describe("GET /product", () => {
    it("should get a product detail", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/products/1")
            .send({token: loginResponse.body.token})
            .expect(200)
            .then(async (res) => {
                expect(res.body.name).toBe("Burnished-Leather Jacket")
                expect(res.body.price).toBe(2415)
            })
    })
    it("should not find a product", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/products/123")
            .send({token: loginResponse.body.token})
            .expect(404)
    })
})

describe("POST /products", () => {
    it("should create a new product", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const newProduct = {
            categoryIds: [
                {categoryId: 1}
            ],
            name: "Black shirt",
            description: "For those nights you don't want to be seen",
            statusId: 1,
            price: 999,
            brandId: 1,
            quantity: 2
        }
        await supertest(app)
            .post("/products")
            .send({token: loginResponse.body.token})
            .send(newProduct)
            .expect(201)
            .then(async res => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.name).toBe("Black shirt")
                expect(res.body.description).toBe("For those nights you don't want to be seen")
                expect(res.body.price).toBe(999),
                expect(res.body.quantity).toBe(2)
            })
    })
})

describe("PUT /products", () => {
    it("should update an existing product", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const updatedProduct = {
            id: 3,
            categoryIds: [
                {categoryId: 1}
            ],
            name: "White shirt",
            description: "For those nights you want to be seen",
            statusId: 1,
            price: 999,
            brandId: 1,
            quantity: 0
        }
        await supertest(app)
            .put("/products/3")
            .send({token: loginResponse.body.token})
            .send(updatedProduct)
            .expect(200)
            .then(async res => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.name).toBe("White shirt")
                expect(res.body.description).toBe("For those nights you want to be seen")
                expect(res.body.price).toBe(999)
            })
    })
    it("should not find a product", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .put("/products/123")
            .send({token: loginResponse.body.token})
            .expect(404)
    })
})

describe("DELETE /product", () => {
    it("should delete a product", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .delete("/products/3")
            .send({token: loginResponse.body.token})
            .expect(204)
            const product = await prisma.product.findUnique({
                where: {
                    id: 123
                }
            })
            expect(product).toBeNull()
    })
})