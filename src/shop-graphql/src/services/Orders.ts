import { AuthenticationError, UserInputError } from "apollo-server-core";
import { Order } from "../types/Orders";

import { prisma } from "../app";

export const orderDetail = {
  orderItems: {
    include: {
      product: true,
    },
  },
  status: true,
};

export const transformOrder = (order: any) => {
  order.items = order.orderItems.map((item: any) => {
    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price: item.price,
      quantity: item.quantity,
    };
  });

  return order as Order;
};

export const findAll = async (userId: number) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: userId,
    },
    include: orderDetail,
  });
  return orders.map((order) => {
    return transformOrder(order);
  });
};

export const find = async (id: number, userId: number) => {
  const order = await prisma.order.findUnique({
    where: {
      id: id,
    },
    include: orderDetail,
  });
  if (!order) {
    throw new UserInputError(`Order with id: ${id} not found`);
  } else if (order.userId != userId) {
    throw new AuthenticationError(`Unauthorized to view order with id: ${id}`);
  }
  return transformOrder(order);
};

export const updateStatus = async (id: number, status: number, userId: number) => {
  const order = await prisma.order.findUnique({
    where: {
      id: id,
    },
  });

  if (!order) {
    throw new UserInputError(`Order with id: ${id} not found`);
  } else if (order.userId !== userId) {
    throw new AuthenticationError(`Unauthorized to view order with id: ${id}`);
  }
  const updatedOrder = await prisma.order.update({
    where: {
      id: id,
    },
    data: {
      orderStatusId: status,
    },
    include: orderDetail,
  });
  return transformOrder(updatedOrder);
};

export const cancelOrder = async (id: number, userId: number) => {
  const order = await prisma.order.findUnique({
    where: {
      id: id,
    },
    include: orderDetail,
  });

  if (!order) {
    throw new UserInputError(`Order with id: ${id} not found`);
  } else if (order.userId !== userId) {
    throw new AuthenticationError(`Unauthorized to edit order with id: ${id}`);
  } else if (order.status.id == 5) {
    throw new UserInputError(`Order with id: ${id} is already cancelled`);
  }

  await prisma
    .$transaction(async (prisma) => {
      const orderItems = order.orderItems.map((item) => {
        return {
          productId: item.productId,
          quantity: item.quantity,
        };
      });

      await Promise.all(
        orderItems.map(async (item) => {
          await prisma.product.update({
            where: {
              id: item.productId,
            },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        })
      );
      await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          orderStatusId: 5,
        },
      });
    })
    .catch((e) => {
      throw e;
    })
    .finally(() => prisma.$disconnect());
};
