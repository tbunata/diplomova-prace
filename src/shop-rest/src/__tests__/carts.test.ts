import { PrismaClient } from "@prisma/client";
import supertest from "supertest";
import { app } from "../app";

const prisma = new PrismaClient();

const login = async (email: string, password: string) => {
  const loginResponse = await supertest(app).post("/users/login").send({ email: email, password: password });
  return loginResponse.body.token;
};

const cartWithFirstItem = {
  id: 1,
  userId: 1,
  items: [
    {
      id: 1,
      productId: 1,
      name: "Burnished-Leather Jacket",
      description: "Orlando Oxfords' leather jacket",
      price: 2415,
      quantity: 2,
    },
  ],
  totalPrice: 4830,
};

const cartWithThirdItem = {
  id: 1,
  userId: 1,
  items: [
    {
      id: 3,
      productId: 1,
      name: "Burnished-Leather Jacket",
      description: "Orlando Oxfords' leather jacket",
      price: 2415,
      quantity: 2,
    },
  ],
  totalPrice: 4830,
};

describe("add item to cart", () => {
  it("should add first item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const cartItem = {
      productId: 1,
      quantity: 2,
    };
    await supertest(app)
      .post("/carts/addItem")
      .set("x-access-token", token)
      .send(cartItem)
      .expect(201)
      .then(async (res) => {
        expect(res.body).toEqual(cartWithFirstItem);
      });
  });
  it("should add second item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const cartItem = {
      productId: 2,
      quantity: 1,
    };
    await supertest(app)
      .post("/carts/addItem")
      .set("x-access-token", token)
      .send(cartItem)
      .expect(201)
      .then(async (res) => {
        expect(res.body.totalPrice).toBe(4855);
      });
  });
  it("should get cart detail with 2 items", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/carts/detail")
      .set("x-access-token", token)
      .expect(200)
      .then(async (res) => {
        expect(res.body.userId).toBe(1);
        expect(res.body.items.length).toBe(2);
        expect(res.body.totalPrice).toBe(4855);
      });
  });
  it("should update item quantity in cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const cartItem = {
      productId: 2,
      quantity: 3,
    };
    await supertest(app)
      .put("/carts/updateItem")
      .set("x-access-token", token)
      .send(cartItem)
      .expect(201)
      .then(async (res) => {
        expect(res.body.userId).toBe(1);
        expect(res.body.totalPrice).toBe(4905);
      });
  });
  it("should clear the cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).delete("/carts/clearCart").set("x-access-token", token).expect(204);
  });
  it("should get empty cart detail", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/carts/detail")
      .set("x-access-token", token)
      .expect(200)
      .then(async (res) => {
        expect(res.body.userId).toBe(1);
      });
    const cartDetail = await prisma.cart.findUnique({
      where: {
        userId: 1,
      },
      include: {
        items: true,
      },
    });

    expect(cartDetail!.userId).toBe(1);
    expect(cartDetail!.items.length).toBe(0);
  });
});

describe("cart walkthrough - checkout", () => {
  it("should add first item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const cartItem = {
      productId: 1,
      quantity: 2,
    };
    await supertest(app)
      .post("/carts/addItem")
      .set("x-access-token", token)
      .send(cartItem)
      .expect(201)
      .then(async (res) => {
        expect(res.body).toEqual(cartWithThirdItem);
      });
  });
  it("should create a new order", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .post("/carts/checkout")
      .set("x-access-token", token)
      .send()
      .expect(200)
      .then(async (res) => {
        const payload = res.body;
        expect(payload.userId).toBe(1);
        expect(payload.items.length).toBe(1);
        expect(payload.price).toBe(4830);
        expect(payload.created).toBeTruthy();
        expect(payload.updated).toBeTruthy();
      });
  });
});
