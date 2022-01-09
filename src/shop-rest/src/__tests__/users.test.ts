import supertest from "supertest";
import { PrismaClient } from '@prisma/client'
import { users } from "../../prisma/seeds/users";
import { userStatuses } from "../../prisma/seeds/userStatuses";
import {app} from "../app"

const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.userStatus.createMany({
        data: userStatuses
    })
    await prisma.user.createMany({
        data: users
    })
})

afterAll(async () => {
    const deleteUsers = prisma.user.deleteMany()
    const deleteUserStatus = prisma.userStatus.deleteMany()

    await prisma.$transaction([
        deleteUsers,
        deleteUserStatus
    ])

    await prisma.$disconnect()
})


describe("GET /users", () => {
    it("should get a list of users", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/users")
            .send({token: loginResponse.body.token})
            .expect(200)
            .then(async (res) => {
                expect(res.body.length).toBe(2)
                expect(res.body[0].firstName).toBe("Havelock")
                expect(res.body[1].firstName).toBe("Samuel")
            })
    })
})

describe("GET /users/:id", () => {
    it("should get user's data", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/users/1")
            .send({token: loginResponse.body.token})
            .expect(200)
            .expect({
                id: 1,
                firstName: "Havelock",
                lastName: "Vetinari",
                email: "lord.vetinari@discworld.am",
                password: "$2a$10$lC9VVx2ZxbpukoFL65t4BuDwV5VWgEwZLZIxWrLKXPVh/qJ7nhjmi",
                phone: '777 666 555',
                address: "Patrician's Palace",
                city: 'Ankh-Morpork',
                zipCode: '100 00',
                statusId: 1
            })
    })
    it("should return 404 for not finding user", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/users/6")
            .send({token: loginResponse.body.token})
            .expect(404)
    })
})

describe("POST /users", () => {
    it('should create 1 new user', async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const user = {
            firstName: "Fred",
            lastName: "Colon",
            email: "fred.colon@ankh-morpork.dw",
            password: "colonovo"
        }
    
        await supertest(app)
            .post("/users")
            .send({token: loginResponse.body.token})
            .send(user)
            .expect(201)
            .then(async res => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.firstName).toBe("Fred")
                expect(res.body.lastName).toBe("Colon")
                expect(res.body.email).toBe("fred.colon@ankh-morpork.dw")
            })
    
    })
})

describe("PUT /users", () => {
    it('should update an existing user', async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        const user = {
            firstName: "Samuel",
            lastName: "Vimes",
            email: "samuel.vimes@cit_watch.am",
            password: "vimesovo",
            statusId: 2,
            address: "Ramkin Residence, Scoone Avenue",
            city: "Ankh",
        }
    
        await supertest(app)
            .put("/users/2")
            .send({token: loginResponse.body.token})
            .send(user)
            .expect(200)
            .then(async res => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.firstName).toBe("Samuel")
                expect(res.body.lastName).toBe("Vimes")
                expect(res.body.email).toBe("samuel.vimes@cit_watch.am")
                expect(res.body.statusId).toBe(2)
                expect(res.body.address).toBe("Ramkin Residence, Scoone Avenue")
                expect(res.body.city).toBe("Ankh")
            })
    
    })
    it("should return 404 for not finding user", async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .get("/users/6")
            .send({token: loginResponse.body.token})
            .expect(404)
    })
})

describe("DELETE /users", () => {
    it('should delete a user', async () => {
        const loginResponse = await supertest(app).post('/users/login').send({email: "lord.vetinari@discworld.am", password: "vetinariho"})
        await supertest(app)
            .delete("/users/1")
            .send({token: loginResponse.body.token})
            .expect(204)
        
        const user = await prisma.user.findUnique({
            where: {
                id: 1
            }
        })
        expect(user).toBeNull()
    })
})