import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../app";
import { Server } from "http";

const prisma = new PrismaClient();
let server: Server;

beforeAll(async () => {
  server = await createApp();
});

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
        }`,
  };
  const loginResponse = await request(server).post("/graphql").send(loginData).expect(200);
  return loginResponse.body.data.loginUser;
};

describe("QUERY allOrders", () => {
  it("should find all orders for logged in user", async () => {
    const queryData = {
      query: `query {
                allOrders {
                    id,
                    userId,
                    created,
                    updated,
                    price,
                    items {
                        id,
                        name,
                        quantity,
                        price
                    }
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.data.allOrders;
        expect(payload.length).toBe(2);
        expect(payload[0].userId).toBe(1);
        expect(payload[0].price).toBe(2415);
        expect(payload[1].userId).toBe(1);
      });
  });
});

describe("QUERY getOrder", () => {
  it("should find a single orders for logged in user", async () => {
    const queryData = {
      query: `query {
                getOrder(id: 3) {
                    id,
                    userId,
                    created,
                    updated,
                    price,
                    items {
                        id,
                        name,
                        quantity,
                        price
                    }
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.data.getOrder;
        expect(payload.userId).toBe(1);
        expect(payload.price).toBe(22000);
        expect(payload.items[0].name).toBe("Destroyer 3000 XL");
      });
  });
});

describe("MUTATION updateOrderStatus", () => {
  it("should update given order's status", async () => {
    const queryData = {
      query: `mutation {
                updateOrderStatus(id: 3, statusId: 2) {
                    status {
                        id,
                        name
                    }
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.data.updateOrderStatus;
        expect(payload.status.id).toBe(2);
        expect(payload.status.name).toBe("Being processed");
      });
  });
});

describe("MUTATION cancelOrder", () => {
  it("should cancel a  given order", async () => {
    const queryData = {
      query: `mutation {
                cancelOrder(id: 3)
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.data.cancelOrder;
        expect(payload).toBe(true);
      });
    const order = await prisma.order.findUnique({
      where: {
        id: 3,
      },
    });
    expect(order!.orderStatusId).toBe(5);
  });
});
