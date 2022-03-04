import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { Server } from 'http'
import { createApp } from '../app'

import { users } from '../../prisma/seeds/users'
import { userStatuses } from '../../prisma/seeds/userStatuses'

const prisma = new PrismaClient()
let server: Server

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

beforeAll(async () => {
    await prisma.userStatus.createMany({
        data: userStatuses
    })
    await prisma.user.createMany({
        data: users
    })
    server = await createApp({port:0})
})

describe('MUTATION loginUser', () => {
    it('should log a user in', async () => {
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        expect(loginInfo.token).toBeTruthy()
        expect(loginInfo.refreshToken).toBeTruthy()
    })
})


describe('QUERY allUsers', () => {
    it('should get a list of users', async () => {
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')

        const queryData = {
            query: `{
                allUsers {
                    id,
                    email,
                    firstName
                } 
            }`,
        }
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.allUsers
                expect(payload.length).toBe(2)
                expect(payload[0].firstName).toBe('Havelock')
                expect(payload[0].email).toBe('lord.vetinari@discworld.am')
                expect(payload[1].firstName).toBe('Samuel')
                expect(payload[1].email).toBe('samuel.vimes@discworld.am')
            })

    })
})

describe('QUERY getUser', () => {
    it('should get user\'s data', async () => {
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        const queryData = {
            query: `{
                getUser(id: 1) {
                    id,
                    email,
                    firstName,
                    lastName,
                    phone,
                    address,
                    city,
                    zipCode,
                    status {
                        id,
                        name
                    }
                } 
            }`,
        }
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.getUser
                expect(payload.id).toBe(1)
                expect(payload.email).toBe('lord.vetinari@discworld.am')
                expect(payload.firstName).toBe('Havelock')
                expect(payload.lastName).toBe('Vetinari')
                expect(payload.phone).toBe('777 666 555')
                expect(payload.address).toBe('Patrician\'s Palace')
                expect(payload.city).toBe('Ankh-Morpork')
                expect(payload.zipCode).toBe('100 00')
                expect(payload.status).toEqual({id: 1, name: 'Created'})
            })
    })
    it('should return error for not finding user', async () => {
        const loginInfo = await loginUser('lord.vetinari@discworld.am', 'vetinariho')
        const queryData = {
            query: '{ getUser(id: 404) { email } }',
        }
        
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.errors
                expect(payload.length).toBe(1)
                expect(payload[0].message).toBe('User with id: 404 not found')
            })
    })
})

describe('MUTATION addUser', () => {
    it('should create a  user', async () => {
        const queryData = {
            query: `mutation {
                addUser(newUserData: {
                    email: "fred.colon@ankh-morpork.dw",
                    firstName: "Fred",
                    lastName: "Colon",
                    password: "colonovo"
                }) {
                    id,
                    email,
                    firstName,
                    lastName,
                    phone,
                    address,
                    city,
                    zipCode,
                    status {
                        id,
                        name
                    }
                } 
            }`,
        }
        await request(server)
            .post('/graphql')
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.addUser
                expect(payload.id).toBe(3)
                expect(payload.email).toBe('fred.colon@ankh-morpork.dw')
                expect(payload.firstName).toBe('Fred')
                expect(payload.lastName).toBe('Colon')
                expect(payload.phone).toBeNull()
                expect(payload.address).toBeNull()
                expect(payload.city).toBeNull()
                expect(payload.zipCode).toBeNull()
                expect(payload.status).toEqual({id: 1, name: 'Created'})
            })
    })
})

describe('MUTATION updateUser', () => {
    it('should update user\'s data', async () => {
        const loginInfo = await loginUser('fred.colon@ankh-morpork.dw', 'colonovo')
        const queryData = {
            query: `mutation {
                updateUser(
                    id: 3,
                    updateUserData: {
                        email: "alfred.colon@ankh-morpork.dw",
                        firstName: "Alfred",
                        address: "Street no. 42",
                        zipCode: "123 33",
                        statusId: 2
                }) {
                    id,
                    email,
                    firstName,
                    lastName,
                    phone,
                    address,
                    city,
                    zipCode,
                    status {
                        id,
                        name
                    }
                } 
            }`,
        }
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.updateUser
                expect(payload.id).toBe(3)
                expect(payload.email).toBe('alfred.colon@ankh-morpork.dw')
                expect(payload.firstName).toBe('Alfred')
                expect(payload.lastName).toBe('Colon')
                expect(payload.phone).toBeNull()
                expect(payload.address).toBe('Street no. 42')
                expect(payload.city).toBeNull()
                expect(payload.zipCode).toBe('123 33')
                expect(payload.status).toEqual({id: 2, name: 'Approved'})
            })
    })
})


describe('MUTATION removeUser', () => {
    it('should remove a product', async () => {
        const loginInfo = await loginUser('alfred.colon@ankh-morpork.dw', 'colonovo')
        const queryData = {
            query: `mutation {
                removeUser(id: 3) 
            }`,
        }
        await request(server)
            .post('/graphql')
            .set('x-access-token', loginInfo.token)
            .send(queryData)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.data.removeUser
                expect(payload).toBe(true)
            })

        const removedUser = await prisma.user.findUnique({
            where: {
                id: 3
            }
        })
        expect(removedUser).toBeNull()
    })
})