import { PrismaClient } from "@prisma/client";
import supertest from "supertest";
import { app } from "../app";

const prisma = new PrismaClient();

const login = async (email: string, password: string) => {
  const loginResponse = await supertest(app).post("/users/login").send({ email: email, password: password });
  return loginResponse.body.token;
};

describe("GET /orders", () => {
  it("should find all orders for logged in user", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/orders")
      .set("x-access-token", token)
      .expect(200)
      .then(async (res) => {
        expect(res.body.length).toBe(2);
        const firstOrder = res.body[0];
        expect(firstOrder.userId).toBe(1);
        expect(firstOrder.price).toBe(2415);
      });
  });
});

describe("GET /orders/id", () => {
  it("should find a single order for logged in user", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/orders/3")
      .set("x-access-token", token)
      .expect(200)
      .then((res) => {
        const order = res.body;
        expect(order).toMatchObject({
          id: 3,
          userId: 1,
          status: {
            id: 3,
            name: "Shipped",
          },
          price: 22000,
          items: [
            {
              id: 3,
              productId: 3,
              name: "Destroyer 3000 XL",
              description: "A superior crossbow ",
              price: 22000,
              quantity: 1,
            },
          ],
        });
        expect(order.created).toBeTruthy();
        expect(order.updated).toBeTruthy();
      });
  });
});

describe("PUT /orders/id", () => {
  it("should update given order's status", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .put("/orders/3/updateStatus")
      .set("x-access-token", token)
      .send({ id: 3, statusId: 2 })
      .expect(200)
      .then((res) => {
        const order = res.body;
        expect(order.status.id).toBe(2);
        expect(order.status.name).toBe("Being processed");
        expect(order.updated).not.toBe(order.created);
      });
  });
});

describe("DELETE /orders/id", () => {
  it("should cancel a  given order", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).delete("/orders/3").set("x-access-token", token).expect(204);

    const order = await prisma.order.findUnique({
      where: {
        id: 3,
      },
    });
    expect(order!.orderStatusId).toBe(5);
  });
});
