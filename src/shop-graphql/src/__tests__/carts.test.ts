import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from '../app'
import { Server } from 'http'

import { orderStatuses } from '../../prisma/seeds/orderStatuses'

const prisma = new PrismaClient()
let server: Server

beforeAll(async () => {
    await prisma.orderStatus.createMany({
        data: orderStatuses
    })
    server = await createApp({port:0})
})

const loginUser = async (email: string, password: string) => {
    const loginData = {
        query: `mutation { 
            loginUser(
                email: "${email}",
                password: "${password}"
            ) {
                token,
                refreshToken
            }
        }`
    }
    const loginResponse = await request(server)
        .post('/graphql')
        .send(loginData)
        .expect(200)
    return loginResponse.body.data.loginUser
}

const cartWithFirstItem = {
    id: 1,
    userId: 1,
    items: [
      {
        id: 1,
        productId: 1,
        name: 'Burnished-Leather Jacket',
        description: "Orlando Oxfords' leather jacket",
        price: '2415',
        quantity: 2
      }
    ],
    totalPrice: 4830
}

const cartWithThirdItem = {
    id: 1,
    userId: 1,
    items: [
      {
        id: 3,
        productId: 1,
        name: 'Burnished-Leather Jacket',
        description: "Orlando Oxfords' leather jacket",
        price: '2415',
        quantity: 2
      }
    ],
    totalPrice: 4830
}

describe("cart walkthrough - clear at end", () => {
    it("should add first item to cart", async () => {
        const queryData = {
            query: `mutation {
                addItemToCart(newCartItemData: {
                    productId: 1,
                    quantity: 2
                }) {
                    id,
                    userId,
                    items {
                        id,
                        productId,
                        name,
                        description,
                        price,
                        quantity
                    },
                    totalPrice
                }
            }`
        }
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.addItemToCart
                expect(payload).toEqual(cartWithFirstItem)
            })
    })
    it("should add second item to cart", async () => {
        const queryData = {
            query: `mutation {
                addItemToCart(newCartItemData: {
                    productId: 2,
                    quantity: 1
                }) {
                    id,
                    totalPrice
                }
            }`
        }
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.addItemToCart
                expect(payload.totalPrice).toBe(4855)
            })
    })
    it("should get cart detail with 2 items", async () => {
        const queryData = {
            query: `{ getCart 
                {
                    items{
                        name
                    }
                    totalPrice
                }
            }`
        }
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.getCart
                expect(payload.totalPrice).toBe(4855)
            })
    })
    it("should update item quantity in cart", async () => {
        const queryData = {
            query: `mutation {
                updateCartItem(updateCartItemData: {
                    productId: 2,
                    quantity: 3
                }) {
                    items{
                        name
                    }
                    totalPrice
                }
            }`
        }
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.updateCartItem
                expect(payload.totalPrice).toBe(4905)
            })
    })
    it("should get empty cart detail", async () => {
        const queryData = {
            query: `mutation {
                clearCart {
                    userId
                    items{
                        name
                    }
                    totalPrice
                }
            }`
        }
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.clearCart
                expect(payload.userId).toBe(1)
                expect(payload.items.length).toBe(0)
                expect(payload.totalPrice).toBe(0)
            })
    })
    it('should return error for checking out empty cart', async () => {
        const queryData = {
            query: `mutation {
                checkoutCart {
                    id,
                    userId,
                    created,
                    updated,
                    price
                } 
            }`,
        }
        
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.errors
                expect(payload.length).toBe(1)
                expect(payload[0].message).toBe('Cart: 1 is empty')
            })
    })
})

describe("cart walkthrough - checkout", () => {
    it("should add first item to cart", async () => {
        const queryData = {
            query: `mutation {
                addItemToCart(newCartItemData: {
                    productId: 1,
                    quantity: 2
                }) {
                    id,
                    userId,
                    items {
                        id,
                        productId,
                        name,
                        description,
                        price,
                        quantity
                    },
                    totalPrice
                }
            }`
        }
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.addItemToCart
                expect(payload).toEqual(cartWithThirdItem)
            })
    })
    it('should create a new order', async () => {
        const queryData = {
            query: `mutation {
                checkoutCart {
                    id,
                    userId,
                    created,
                    updated,
                    price,
                    items {
                        name
                    }
                } 
            }`,
        }
        
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                console.log(res.text);
                
                const payload = res.body.data.checkoutCart
                console.log(payload);
                
                expect(payload.userId).toBe(1)
                expect(payload.items.length).toBe(1)
                expect(payload.price).toBe(4830)
                expect(payload.created).toBeTruthy()
                expect(payload.updated).toBeTruthy()
            })
    })
})