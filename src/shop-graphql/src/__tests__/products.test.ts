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


const productToFetch = {
    id: 1,
    name: 'Burnished-Leather Jacket',
    description: 'Orlando Oxfords\' leather jacket',
    quantity: 12,
    categories: [{
        id: 1,
        name: 'Men',
        description: "Products designed for men"
    }, {
        id: 4,
        name: 'Jackets',
        description: "For tough weather"
    }],
    status: {
        id: 1,
        name: 'New'
    },
    price: 2415,
    brand: {
        id: 1,
        name: 'Kingsman',
        description: 'High end clothing for men'
    },
}

const productToCreate = {
    id: 3,
    name: 'White shirt',
    description: 'A really white shirt',
    quantity: 6,
    categories: [{
        id: 1,
        name: 'Men',
        description: "Products designed for men"
    }],
    status: {
        id: 1,
        name: 'New'
    },
    price: 999,
    brand: {
        id: 2,
        name: 'Stronginthearm & son',
        description: 'Weapons for everyday use'
    },
}

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

describe('QUERY allProducts', () => {
    it('should get a list of products', async () => {
        const queryData = {
            query: `{ 
                allProducts {
                    id,
                    name,
                    description,
                    price,
                    quantity,
                    categories {
                        id,
                        name,
                        description
                    }
                    brand {
                        id,
                        name,
                        description
                    },
                    status {
                        id,
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
                const payload = res.body.data.allProducts
                expect(payload.length).toBe(2)
                expect(payload[0]).toEqual(productToFetch)
                expect(payload[1].name).toBe('Striped Cotton-Blend Socks')
            })
    })
    it("should get a filtered list of products", async () => {
        const queryData = {
            query: `{ 
                allProducts(productFilterData: {
                    minPrice: 20,
                    maxPrice: 100
                }) {
                    name,
                    price,
                    quantity,
                } 
            }`,
        }

        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post("/graphql")
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.allProducts
                expect(payload.length).toBe(1)
                expect(payload[0].name).toBe("Striped Cotton-Blend Socks")
                expect(payload[0].price).toBe(25)
                expect(payload[0].quantity).toBe(37)
            })
    })
})

describe('QUERY getProduct', () => {
    it('should get a single product', async () => {
        const queryData = {
            query: `{ 
                getProduct(id: 1) {
                    id,
                    name,
                    description,
                    price,
                    quantity,
                    categories {
                        id,
                        name,
                        description
                    }
                    brand {
                        id,
                        name,
                        description
                    },
                    status {
                        id,
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
                const payload = res.body.data.getProduct
                expect(payload).toEqual(productToFetch)
            })
    })
    it('should return error for not finding product', async () => {
        const queryData = {
            query: '{ getProduct(id: 404) { name } }',
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
                expect(payload[0].message).toBe('Product with id: 404 not found')
            })
    })
})

describe('MUTATION addProduct', () => {
    it('should create a product', async () => {
        const queryData = {
            query: `mutation { 
                addProduct(newProductData: {
                    name: "White shirt",
                    description: "A really white shirt",
                    price: 999,
                    quantity: 6,
                    categoryIds: [1],
                    brandId: 2,
                    statusId: 1
                }) {
                    id,
                    name,
                    description,
                    price,
                    quantity,
                    categories {
                        id,
                        name,
                        description
                    }
                    brand {
                        id,
                        name,
                        description
                    },
                    status {
                        id,
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
                const payload = res.body.data.addProduct
                expect(payload).toEqual(productToCreate)
            })
    })
})

describe('MUTATION updateProduct', () => {
    it('should update a product', async () => {
        const queryData = {
            query: `mutation { 
                updateProduct(
                    id: 3,
                    updateProductData: {
                        name: "Black shirt",
                        description: "When you don't want to be seen",
                        price: 1999,
                        quantity: 12,
                        categoryIds: [2, 6],
                        brandId: 1,
                        statusId: 2
                    }
                ) {
                    id,
                    name,
                    description,
                    price,
                    quantity,
                    categories {
                        id
                    }
                    brand {
                        id
                    },
                    status {
                        id
                    }
                } 
            }`,
        }
        const updatedProduct = {
            ...productToCreate,
            name: "Black shirt",
            description: "When you don't want to be seen",
            price: 1999,
            quantity: 12,
            categories: [{
                id: 2
            },{
                id: 6
            }],
            status: {
                id: 2
            },
            brand: {
                id: 1
            }
        }

        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.updateProduct
                expect(payload).toEqual(updatedProduct)
            })
    })
    it('should return error for not finding product', async () => {
        const queryData = {
            query: `mutation {
                updateProduct(
                    id: 404,
                    updateProductData: {
                        name: "Shouldn't be changed"
                    }
                ) { name } }`,
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
                expect(payload[0].message).toBe('Product with id: 404 not found')
            })
    })
})

describe('MUTATION removeProduct', () => {
    it('should remove a product', async () => {
        const queryData = {
            query: `mutation {
                removeProduct(id: 3) 
            }`,
        }

        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.removeProduct
                expect(payload).toBe(true)
            })

        const removedProduct = await prisma.product.findUnique({
            where: {
                id: 3
            }
        })
        expect(removedProduct).toBeNull()
    })
})