import supertest from "supertest";
import { PrismaClient } from '@prisma/client'
import {app} from "../app"

const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.userStatus.createMany({
        data: [{name: "created"}, {name: "approved"}]
    })
    await prisma.user.createMany({
        data: [
            {
                firstName: "Havelock",
                lastName: "Vetinari",
                email: "lord.vetinari@ankh-morpork.dw",
                password: "vetinariho",
                statusId: 2
            }, {
                firstName: "Samuel",
                lastName: "Vimes",
                email: "samuel.vimes@ankh-morpork.dw",
                password: "vimesovo",
                statusId: 1
            }
        ]
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
        await supertest(app)
            .get("/users")
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
        await supertest(app)
            .get("/users/1")
            .expect(200)
            .expect({
                id: 1,
                firstName: "Havelock",
                lastName: "Vetinari",
                email: "lord.vetinari@ankh-morpork.dw",
                password: "vetinariho",
                statusId: 2,
                phone: null,
                address: null,
                city: null,
                zipCode: null,
            })
    })
    it("should return 404 for not finding user", async () => {
        await supertest(app)
            .get("/users/6")
            .expect(404)
    })
})

describe("POST /users", () => {
    it('should create 1 new user', async () => {
        const user = {
            firstName: "Fred",
            lastName: "Colon",
            email: "fred.colon@ankh-morpork.dw",
            password: "colonovo"
        }
    
        await supertest(app)
            .post("/users")
            .send(user)
            .expect(201)
            .then(async res => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.firstName).toBe("Fred")
                expect(res.body.lastName).toBe("Colon")
                expect(res.body.email).toBe("fred.colon@ankh-morpork.dw")
                expect(res.body.password).toBe("colonovo")
            })
    
    })
})

describe("PUT /users", () => {
    it('should update an existing user', async () => {
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
            .send(user)
            .expect(200)
            .then(async res => {
                expect(res.body.id).toBeTruthy()
                expect(res.body.firstName).toBe("Samuel")
                expect(res.body.lastName).toBe("Vimes")
                expect(res.body.email).toBe("samuel.vimes@cit_watch.am")
                expect(res.body.password).toBe("vimesovo")
                expect(res.body.statusId).toBe(2)
                expect(res.body.address).toBe("Ramkin Residence, Scoone Avenue")
                expect(res.body.city).toBe("Ankh")
            })
    
    })
    it("should return 404 for not finding user", async () => {
        await supertest(app)
            .get("/users/6")
            .expect(404)
    })
})

describe("DELETE /users", () => {
    it('should delete a user', async () => {
        await supertest(app)
            .delete("/users/1")
            .expect(204)
        
        const user = await prisma.user.findUnique({
            where: {
                id: 1
            }
        })
        expect(user).toBeNull()
    })
})