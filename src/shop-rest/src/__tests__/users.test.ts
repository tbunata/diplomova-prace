import supertest from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../app";

const prisma = new PrismaClient();

const login = async (email: string, password: string) => {
  const loginResponse = await supertest(app).post("/users/login").send({ email: email, password: password });
  return loginResponse.body.token;
};

describe("GET /users", () => {
  it("should get a list of users", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/users")
      .set("x-access-token", token)
      .expect(200)
      .then(async (res) => {
        expect(res.body.length).toBe(2);
        expect(res.body[0].firstName).toBe("Havelock");
        expect(res.body[1].firstName).toBe("Samuel");
      });
  });
});

describe("GET /users/:id", () => {
  it("should get user's data", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).get("/users/1").set("x-access-token", token).expect(200).expect({
      id: 1,
      firstName: "Havelock",
      lastName: "Vetinari",
      email: "lord.vetinari@discworld.am",
      password: "$2a$10$lC9VVx2ZxbpukoFL65t4BuDwV5VWgEwZLZIxWrLKXPVh/qJ7nhjmi",
      phone: "777 666 555",
      address: "Patrician's Palace",
      city: "Ankh-Morpork",
      zipCode: "100 00",
      statusId: 1,
    });
  });
  it("should return 404 for not finding user", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).get("/users/6").set("x-access-token", token).expect(404);
  });
});

describe("POST /users", () => {
  it("should create 1 new user", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const user = {
      firstName: "Fred",
      lastName: "Colon",
      email: "fred.colon@ankh-morpork.dw",
      password: "colonovo",
    };

    await supertest(app)
      .post("/users")
      .set("x-access-token", token)
      .send(user)
      .expect(201)
      .then(async (res) => {
        expect(res.body.id).toBeTruthy();
        expect(res.body.firstName).toBe("Fred");
        expect(res.body.lastName).toBe("Colon");
        expect(res.body.email).toBe("fred.colon@ankh-morpork.dw");
      });
  });
});

describe("PUT /users", () => {
  it("should update an existing user", async () => {
    const token = await login("samuel.vimes@discworld.am", "vimesovo");
    const user = {
      firstName: "Sam",
      lastName: "Vimes",
      email: "samuel.vimes@discworld.am",
      password: "vimesovo",
      statusId: 2,
      address: "Ramkin Residence, Scoone Avenue",
      city: "Ankh",
    };

    await supertest(app)
      .put("/users")
      .set("x-access-token", token)
      .send(user)
      .expect(200)
      .then(async (res) => {
        expect(res.body.id).toBeTruthy();
        expect(res.body.firstName).toBe("Sam");
        expect(res.body.lastName).toBe("Vimes");
        expect(res.body.email).toBe("samuel.vimes@discworld.am");
        expect(res.body.status.id).toBe(2);
        expect(res.body.address).toBe("Ramkin Residence, Scoone Avenue");
        expect(res.body.city).toBe("Ankh");
      });
  });
});

describe("DELETE /users", () => {
  it("should delete a user", async () => {
    const token = await login("samuel.vimes@discworld.am", "vimesovo");
    await supertest(app).delete("/users").set("x-access-token", token).expect(204);

    const user = await prisma.user.findUnique({
      where: {
        id: 2,
      },
    });
    expect(user).toBeNull();
  });
});
