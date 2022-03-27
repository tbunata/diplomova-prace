import { PrismaClient } from "@prisma/client";
import { Cart, NewCartItemInput, UpdateCartItemInput } from "./interface";
import { UnprocessableEntityError, NotFoundError } from "../helper/errors";
import { transformOrder } from "../orders/service";
import { productEmmiter } from "../products/router";

const prisma = new PrismaClient();

const cartItemDetail = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          quantity: true,
        },
      },
    },
  },
};

const orderDetail = {
  orderItems: {
    include: {
      product: true,
    },
  },
  status: true,
};

const transformCart = (cart: any) => {
  let totalPrice = 0;
  cart.items = cart.items.map((item: any) => {
    totalPrice += item.product.price * item.quantity;
    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      quantity: item.quantity,
    };
  });

  return (cart = {
    ...cart,
    totalPrice: totalPrice,
  } as Cart);
};

export const find = async (userId: number) => {
  const cart: any = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
    include: cartItemDetail,
  });
  if (!cart) {
    throw new NotFoundError(`Cart for user: ${userId} not found`);
  }
  return transformCart(cart);
};

export const addItem = async (userId: number, cartItem: NewCartItemInput) => {
  let cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId,
      },
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      id: cartItem.productId,
    },
  });
  if (!product || product.statusId === 4) {
    throw new NotFoundError(`Product with id : ${cartItem.productId} not found`);
  } else if (product.quantity < cartItem.quantity) {
    throw new UnprocessableEntityError(`Not enough stock for product with id: ${cartItem.productId}`);
  }

  await prisma.cartItem.upsert({
    where: {
      productId_cartId: {
        productId: cartItem.productId,
        cartId: cart.id,
      },
    },
    update: {
      quantity: {
        increment: cartItem.quantity,
      },
    },
    create: {
      productId: cartItem.productId,
      cartId: cart.id,
      quantity: cartItem.quantity,
    },
  });

  const updatedCart = (await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
    include: cartItemDetail,
  })) as any;
  return transformCart(updatedCart);
};

export const updateItem = async (userId: number, cartItem: UpdateCartItemInput) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!cart) {
    throw new NotFoundError(`Cart for user: ${userId} not found`);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: cartItem.productId,
    },
  });
  if (!product || product.statusId === 4) {
    throw new NotFoundError(`Product with id : ${cartItem.productId} not found`);
  } else if (product.quantity < cartItem.quantity) {
    throw new UnprocessableEntityError(`Not enough stock for product with id: ${cartItem.productId}`);
  }

  if (cartItem.quantity === 0) {
    await prisma.cartItem.delete({
      where: {
        productId_cartId: {
          cartId: cart.id,
          productId: cartItem.productId,
        },
      },
    });
    return { message: "Item removed from cart" };
  } else {
    await prisma.cartItem.update({
      where: {
        productId_cartId: {
          cartId: cart.id,
          productId: cartItem.productId,
        },
      },
      data: {
        quantity: cartItem.quantity,
      },
    });
  }
  return await find(userId);
};

export const clearCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!cart) {
    throw new NotFoundError(`Cart for user: ${userId} not found`);
  }
  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });
  return find(userId);
};

export const checkoutCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
    include: {
      items: {
        include: {
          product: {},
        },
      },
    },
  });
  if (!cart) {
    throw new NotFoundError(`Cart for user: ${userId} not found`);
  } else if (cart.items.length === 0) {
    throw new UnprocessableEntityError(`Cart: ${cart.id} is empty`);
  }
  const order = await prisma
    .$transaction(async (prisma) => {
      let totalPrice = 0;
      const orderItems = cart.items.map((item) => {
        totalPrice += item.product.price * item.quantity;
        return {
          productId: item.productId,
          price: item.product.price,
          quantity: item.quantity,
        };
      });

      const newOrder = await prisma.order.create({
        data: {
          price: totalPrice,
          orderStatusId: 1,
          userId: userId,
          orderItems: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: orderDetail,
      });

      await Promise.all(
        cart.items.map(async (item) => {
          if (item.quantity > item.product.quantity) {
            throw new UnprocessableEntityError(`Item: ${item.id} named ${item.product.name} sold out`);
          }
          await prisma.product.update({
            where: {
              id: item.productId,
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        })
      );
      await clearCart(userId);
      productEmmiter.emit("update");
      return transformOrder(newOrder);
    })
    .catch((e) => {
      throw e;
    })
    .finally(() => prisma.$disconnect());
  return order;
};
