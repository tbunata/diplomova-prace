import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { Server } from 'http'
import { createApp } from '../app'

import { users } from '../../prisma/seeds/users'
import { userStatuses } from '../../prisma/seeds/userStatuses'

const prisma = new PrismaClient()
let server: Server

beforeAll(async () => {
    await prisma.userStatus.createMany({
        data: userStatuses
    })
    await prisma.user.createMany({
        data: users
    })
    server = await createApp({port:0})
})


describe('QUERY allUsers', () => {
    it('should get a list of users', async () => {
        const queryData = {
            query: '{ allUsers { id, email } }',
        }
        console.log('hello tester')
        const response = await request(server)
            .post('/graphql')
            .send(queryData)
        console.log(response.text)

    })
})