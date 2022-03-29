import { PrismaClient } from "@prisma/client";
import { UserInputError } from "apollo-server-core";
import { PRODUCT_DELETED_STATUS } from "../constants";
import { Cart, NewCartItemInput, UpdateCartItemInput } from "../types/Carts";
import { transformOrder } from "./Orders";

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

export const findAll = async () => {
  const carts = await prisma.cart.findMany({
    include: cartItemDetail,
  });
  return carts.map((cart) => transformCart(cart));
};

export const find = async (userId: number) => {
  const cart: any = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
    include: cartItemDetail,
  });
  if (!cart) {
    throw new UserInputError(`Cart for user: ${userId} not found`);
  }

  return transformCart(cart);
};

export const addItem = async (userId: number, newCartItemData: NewCartItemInput) => {
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
      id: newCartItemData.productId,
    },
  });
  if (!product || product.statusId === PRODUCT_DELETED_STATUS) {
    throw new UserInputError(`Product with id : ${newCartItemData.productId} not found`);
  } else if (product.quantity < newCartItemData.quantity) {
    throw new UserInputError(`Not enough stock for product with id: ${newCartItemData.productId}`);
  }

  await prisma.cartItem.upsert({
    where: {
      productId_cartId: {
        productId: newCartItemData.productId,
        cartId: cart.id,
      },
    },
    update: {
      quantity: {
        increment: newCartItemData.quantity,
      },
    },
    create: {
      productId: newCartItemData.productId,
      cartId: cart.id,
      quantity: newCartItemData.quantity,
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

export const updateItem = async (userId: number, updateCartItemData: UpdateCartItemInput) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!cart) {
    throw new UserInputError(`Cart for user: ${userId} not found`);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: updateCartItemData.productId,
    },
  });
  if (!product || product.statusId === PRODUCT_DELETED_STATUS) {
    throw new UserInputError(`Product with id : ${updateCartItemData.productId} not found`);
  } else if (product.quantity < updateCartItemData.quantity) {
    throw new UserInputError(`Not enough stock for product with id: ${updateCartItemData.productId}`);
  }

  if (updateCartItemData.quantity === 0) {
    await prisma.cartItem.delete({
      where: {
        productId_cartId: {
          cartId: cart.id,
          productId: updateCartItemData.productId,
        },
      },
    });
  } else {
    await prisma.cartItem.update({
      where: {
        productId_cartId: {
          cartId: cart.id,
          productId: updateCartItemData.productId,
        },
      },
      data: {
        quantity: updateCartItemData.quantity,
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
    throw new UserInputError(`Cart for user: ${userId} not found`);
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
    include: cartItemDetail,
  });
  if (!cart) {
    throw new UserInputError(`Cart for user: ${userId} not found`);
  } else if (cart.items.length === 0) {
    throw new UserInputError(`Cart: ${cart.id} is empty`);
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
            throw new UserInputError(`Item: ${item.id} named ${item.product.name} sold out`);
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

      await prisma.cart.delete({
        where: {
          userId: userId
        }
      })
      return transformOrder(newOrder);
    })
    .catch((e) => {
      throw e;
    })
    .finally(() => prisma.$disconnect());
  return order;
};
