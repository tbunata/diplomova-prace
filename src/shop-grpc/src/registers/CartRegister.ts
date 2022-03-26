import { ProtoCat } from "protocat";
import { CartRegisterService } from "../../dist/api/cart/cart_grpc_pb";
import { Cart as CartResponse, CartItem } from "../../dist/api/cart/cart_pb";
import * as CartService from "../services/CartService";
import { validate } from "class-validator";
import { ServerContext } from "../types/server-context";
import { Cart, NewCartItemInput, UpdateCartItemInput } from "../types/Carts";
import { createOrderResponse } from "./OrderRegister";
import { InvalidArgumentError, UnauthorizedError } from "../helper/errors";
import { productEmmiter } from "./ProductRegister";

export const addCartServiceRegister = (app: ProtoCat<ServerContext>) => {
  app.addService(CartRegisterService, {
    getCart: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const cart = await CartService.find(call.user.id);
      call.response.setCart(createCartResponse(cart));
    },

    listCarts: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const carts = await CartService.findAll();
      call.response.setCartsList(createListCartsResponse(carts));
    },

    addCartItem: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const newCartItemInput = new NewCartItemInput(call.request);
      await validate(newCartItemInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const cart = await CartService.addItem(call.user.id, newCartItemInput);
      call.response.setCart(createCartResponse(cart));
    },

    updateCartItem: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const updateCartItemInput = new UpdateCartItemInput(call.request);
      await validate(updateCartItemInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const cart = await CartService.updateItem(call.user.id, updateCartItemInput);
      call.response.setCart(createCartResponse(cart));
    },

    clearCart: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      await CartService.clearCart(call.user.id);
    },

    checkoutCart: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const order = await CartService.checkoutCart(call.user.id);
      productEmmiter.emit("update", null);
      call.response.setOrder(createOrderResponse(order));
    },
  });
};

const createCartResponse = (cart: Cart) => {
  return new CartResponse()
    .setId(cart.id)
    .setUserId(cart.userId)
    .setCartItemsList(
      cart.items.map((item) => {
        return new CartItem()
          .setId(item.id)
          .setProductId(item.productId)
          .setName(item.name)
          .setDescription(item.description)
          .setPrice(item.price)
          .setQuantity(item.quantity);
      })
    )
    .setTotalPrice(cart.totalPrice);
};

const createListCartsResponse = (carts: Cart[]) => {
  return carts.map((cart) => {
    return createCartResponse(cart);
  });
};
