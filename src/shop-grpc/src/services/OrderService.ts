import { PrismaClient } from "@prisma/client";
import { ORDER_STATUS_CANCELLED } from "../helper/constants";
import { NotFoundError, UnauthorizedError, UnprocessableEntityError } from "../helper/errors";
import { Order, UpdateOrderStatusInput } from "../types/Orders";

const prisma = new PrismaClient();

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
    throw new NotFoundError(`Order with id: ${id} not found`);
  } else if (order.userId != userId) {
    throw new UnauthorizedError(`Unauthorized to view order with id: ${id}`);
  }
  return transformOrder(order);
};

export const updateStatus = async (updateStatusInput: UpdateOrderStatusInput, userId: number) => {
  const order = await prisma.order.findUnique({
    where: {
      id: updateStatusInput.id,
    },
  });

  if (!order) {
    throw new NotFoundError(`Order with id: ${updateStatusInput.id} not found`);
  } else if (order.userId !== userId) {
    throw new UnauthorizedError(`Unauthorized to view order with id: ${updateStatusInput.id}`);
  }
  const updatedOrder = await prisma.order.update({
    where: {
      id: updateStatusInput.id,
    },
    data: {
      orderStatusId: updateStatusInput.statusId,
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
    throw new NotFoundError(`Order with id: ${id} not found`);
  } else if (order.userId !== userId) {
    throw new UnauthorizedError(`Unauthorized to edit order with id: ${id}`);
  } else if (order.status.id == ORDER_STATUS_CANCELLED) {
    throw new UnprocessableEntityError(`Order with id: ${id} is already cancelled`);
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
          orderStatusId: ORDER_STATUS_CANCELLED,
        },
      });
    })
    .catch((e) => {
      throw e;
    })
    .finally(() => prisma.$disconnect());
};
