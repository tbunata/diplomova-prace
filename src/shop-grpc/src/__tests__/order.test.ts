import { PrismaClient } from "@prisma/client";
import { createClient } from "protocat";
import { ChannelCredentials } from "@grpc/grpc-js";
import { UserRegisterClient } from "../../dist/api/user/user_grpc_pb";
import { OrderRegisterClient } from "../../dist/api/order/order_grpc_pb";
import { app } from "../app";
import { Order as OrderResponse } from "../../dist/api/order/order_pb";

const prisma = new PrismaClient();
const ADDRESS = "0.0.0.0:3336";
const client = createClient(
  {
    order: OrderRegisterClient,
    user: UserRegisterClient,
  },
  ADDRESS,
  ChannelCredentials.createInsecure()
);

beforeAll(async () => {
  app.start(ADDRESS);
});

afterAll(() => app.stop());

const login = async (email: string, password: string) => {
  const { response } = await client.user.loginUser((req, metadata) => {
    req.setEmail(email);
    req.setPassword(password);
  });
  return response.getToken();
};

const createOrderFromResponse = (order: OrderResponse) => {
  return {
    id: order.getId(),
    userId: order.getUserId(),
    created: order.getCreated()?.toDate(),
    updated: order.getUpdated()?.toDate(),
    status: {
      id: order.getStatus()?.getId(),
      name: order.getStatus()?.getName(),
    },
    price: order.getPrice(),
    items: order.getItemsList().map((item) => {
      return {
        id: item.getId(),
        productId: item.getProductId(),
        name: item.getName(),
        description: item.getDescription(),
        price: item.getPrice(),
        quantity: item.getQuantity(),
      };
    }),
  };
};

describe("listOrders", () => {
  it("should find all orders for logged in user", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.order.listOrders((req, metadata) => {
      metadata.set("authorization", token);
    });

    expect(response.getOrdersList().length).toBe(2);

    const firstOrder = createOrderFromResponse(response.getOrdersList()[0]);
    expect(firstOrder.userId).toBe(1);
    expect(firstOrder.price).toBe(2415);
  });
});

describe("getOrder", () => {
  it("should find a single orders for logged in user", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.order.getOrder((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(3);
    });
    const order = createOrderFromResponse(response.getOrder()!);
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

describe("updateOrderStatus", () => {
  it("should update given order's status", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.order.updateOrderStatus((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(3);
      req.setStatusId(2);
    });
    const order = createOrderFromResponse(response.getOrder()!);
    expect(order.status.id).toBe(2);
    expect(order.status.name).toBe("Being processed");
    expect(order.updated).not.toBe(order.created);
  });
});

describe("cancelOrder", () => {
  it("should cancel a  given order", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.order.cancelOrder((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(3);
    });

    const order = await prisma.order.findUnique({
      where: {
        id: 3,
      },
    });
    expect(order!.orderStatusId).toBe(5);
  });
});
