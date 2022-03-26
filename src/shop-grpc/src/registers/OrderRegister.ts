import { ProtoCat } from "protocat";
import { OrderRegisterService } from "../../dist/api/order/order_grpc_pb";
import { Order as OrderResponse, OrderItem, OrderStatus } from "../../dist/api/order/order_pb";
import * as OrderService from "../services/OrderService";
import { validate } from "class-validator";
import { ServerContext } from "../types/server-context";
import { Order, UpdateOrderStatusInput } from "../types/Orders";
import { InvalidArgumentError, UnauthorizedError } from "../helper/errors";
import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";

export const addOrderServiceRegister = (app: ProtoCat<ServerContext>) => {
  app.addService(OrderRegisterService, {
    getOrder: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const orderId = call.request.getId();
      const order = await OrderService.find(orderId, call.user.id);
      call.response.setOrder(createOrderResponse(order));
    },

    listOrders: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const orders = await OrderService.findAll(call.user.id);
      const ordersResponse = createListOrdersResponse(orders);
      call.response.setOrdersList(ordersResponse);
    },

    updateOrderStatus: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const updateStatusInput = new UpdateOrderStatusInput(call.request);
      await validate(updateStatusInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const orders = await OrderService.updateStatus(updateStatusInput, call.user.id);
      call.response.setOrder(createOrderResponse(orders));
    },

    cancelOrder: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const orderId = call.request.getId();
      await OrderService.cancelOrder(orderId, call.user.id);
    },
  });
};

export const createOrderResponse = (order: Order) => {
  const created = new Timestamp();
  created.fromDate(order.created);
  const updated = new Timestamp();
  updated.fromDate(order.updated);

  return new OrderResponse()
    .setId(order.id)
    .setUserId(order.userId)
    .setStatus(new OrderStatus().setId(order.status.id).setName(order.status.name))
    .setItemsList(
      order.items.map((item) => {
        return new OrderItem()
          .setId(item.id)
          .setProductId(item.productId)
          .setName(item.name)
          .setDescription(item.description)
          .setPrice(item.price)
          .setQuantity(item.quantity);
      })
    )
    .setPrice(order.price)
    .setCreated(created)
    .setUpdated(updated);
};

const createListOrdersResponse = (orders: Order[]) => {
  return orders.map((order) => {
    return createOrderResponse(order);
  });
};
