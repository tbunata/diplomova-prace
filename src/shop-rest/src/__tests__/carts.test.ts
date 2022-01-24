import {app} from "../app"
import supertest from "supertest";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe("add item to cart", () => {
    it("should add first item to cart", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const cartItem = {
            productId: 2,
            quantity: 7
        }
        await supertest(app)
            .post("/carts/addItem")
            .send({token: loginResponse.body.token})
            .send(cartItem)
            .expect(201)
            .then(async (res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.quantity).toBe(7)
                expect(res.body.productId).toBe(2)
            })
    })
    it("should add second item to cart", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const cartItem = {
            productId: 1,
            quantity: 1
        }
        await supertest(app)
            .post("/carts/addItem")
            .send({token: loginResponse.body.token})
            .send(cartItem)
            .expect(201)
            .then(async (res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.quantity).toBe(1)
                expect(res.body.productId).toBe(1)
            })
    })
    it("should get cart detail with 2 items", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/carts/detail")
            .send({token: loginResponse.body.token})
            .expect(200)
            .then(async (res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.items.length).toBe(2)
                expect(res.body.totalPrice).toBe(2590)
            })
    })
    it("should update item quantity in cart", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const cartItem = {
            productId: 2,
            quantity: 5
        }
        await supertest(app)
            .put("/carts/updateItem")
            .send({token: loginResponse.body.token})
            .send(cartItem)
            .expect(201)
            .then(async (res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.quantity).toBe(5)
                expect(res.body.productId).toBe(2)
            })
    })
    it("should get cart detail with updated item", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/carts/detail")
            .send({token: loginResponse.body.token})
            .expect(200)
            .then(async (res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.items.length).toBe(2)
                expect(res.body.totalPrice).toBe(2540)
            })
    })
    it("should clear the cart", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .delete("/carts/clearCart")
            .send({token: loginResponse.body.token})
            .expect(204)
    })
    it("should get empty cart detail", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/carts/detail")
            .send({token: loginResponse.body.token})
            .expect(200)
            .then(async (res) => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.items.length).toBe(0)
                expect(res.body.totalPrice).toBe(0)
            })
    })
})