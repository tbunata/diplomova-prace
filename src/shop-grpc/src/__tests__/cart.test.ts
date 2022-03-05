import { PrismaClient } from "@prisma/client";
import { createClient } from "protocat";
import { ChannelCredentials } from "@grpc/grpc-js";
import { UserRegisterClient } from "../../dist/api/user/user_grpc_pb";
import { app } from "../app";
import { CartRegisterClient } from "../../dist/api/cart/cart_grpc_pb";
import { Cart as CartResponse } from "../../dist/api/cart/cart_pb";

const prisma = new PrismaClient();
const ADDRESS = "0.0.0.0:3335";
let client = createClient(
  {
    cart: CartRegisterClient,
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

const createCartFromResponse = (cart: CartResponse) => {
  return {
    id: cart.getId(),
    userId: cart.getUserId(),
    items: cart.getCartItemsList().map((item) => {
      return {
        id: item.getId(),
        productId: item.getProductId(),
        name: item.getName(),
        description: item.getDescription(),
        price: item.getPrice(),
        quantity: item.getQuantity(),
      };
    }),
    totalPrice: cart.getTotalPrice(),
  };
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

describe("cart walkthrough - clear at end", () => {
  it("should add first item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.addCartItem((req, metadata) => {
      metadata.set("authorization", token);
      req.setProductId(1);
      req.setQuantity(2);
    });

    const newCart = createCartFromResponse(response.getCart()!);
    expect(newCart).toEqual(cartWithFirstItem);
  });
  it("should add second item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.addCartItem((req, metadata) => {
      metadata.set("authorization", token);
      req.setProductId(2);
      req.setQuantity(1);
    });
    const cartWithSecondItem = createCartFromResponse(response.getCart()!);
    expect(cartWithSecondItem.totalPrice).toBe(4855);
  });
  it("should get cart detail with 2 items", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.getCart((req, metadata) => {
      metadata.set("authorization", token);
    });
    const cartDetail = createCartFromResponse(response.getCart()!);
    expect(cartDetail.totalPrice).toBe(4855);
  });
  it("should update item quantity in cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.updateCartItem((req, metadata) => {
      metadata.set("authorization", token);
      req.setProductId(2);
      req.setQuantity(3);
    });
    const updatedCart = createCartFromResponse(response.getCart()!);
    expect(updatedCart.totalPrice).toBe(4905);
  });
  it("should clear a cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.clearCart((req, metadata) => {
      metadata.set("authorization", token);
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
  it("should return error for checking out empty cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.cart
      .checkoutCart((req, metadata) => {
        metadata.set("authorization", token);
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("9 FAILED_PRECONDITION: Cart: 1 is empty");
      });
  });
});

describe("cart walkthrough - checkout", () => {
  it("should add first item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.addCartItem((req, metadata) => {
      metadata.set("authorization", token);
      req.setProductId(1);
      req.setQuantity(2);
    });
    const newCart = createCartFromResponse(response.getCart()!);
    expect(newCart).toEqual(cartWithThirdItem);
  });
  it("should create a new order", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.cart.checkoutCart((req, metadata) => {
      metadata.set("authorization", token);
    });

    const order = response.getOrder()!;
    expect(order.getUserId()).toBe(1);
    expect(order.getItemsList().length).toBe(1);
    expect(order.getPrice()).toBe(4830);
    expect(order.getCreated()).toBeTruthy();
    expect(order.getUpdated()).toBeTruthy();
  });
});
