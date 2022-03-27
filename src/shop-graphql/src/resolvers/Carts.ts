import "reflect-metadata";
import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from "type-graphql";
import { Cart, NewCartItemInput, UpdateCartItemInput } from "../types/Carts";
import * as CartService from "../services/Carts";
import { Context } from "../auth/auth-checker";
import { Order } from "../types/Orders";

@Resolver(Cart)
export class CartResolver {
  @Authorized()
  @Query((returns) => [Cart])
  async allCarts() {
    const carts = await CartService.findAll();
    return carts;
  }

  @Authorized()
  @Query((returns) => Cart, { nullable: true })
  async getCart(@Ctx() ctx: Context) {
    return await CartService.find(ctx.user!.id);
  }

  @Authorized()
  @Mutation((returns) => Cart)
  async addItemToCart(@Arg("newCartItemData") newCartItemData: NewCartItemInput, @Ctx() ctx: Context) {
    return await CartService.addItem(ctx.user!.id, newCartItemData);
  }

  @Authorized()
  @Mutation((returns) => Cart)
  async updateCartItem(@Arg("updateCartItemData") updateCartItemData: UpdateCartItemInput, @Ctx() ctx: Context) {
    return await CartService.updateItem(ctx.user!.id, updateCartItemData);
  }

  @Authorized()
  @Mutation((returns) => Cart)
  async clearCart(@Ctx() ctx: Context) {
    const emptyCart = await CartService.clearCart(ctx.user!.id);
    return emptyCart;
  }

  @Authorized()
  @Mutation((returns) => Order)
  async checkoutCart(@Ctx() ctx: Context) {
    const order = await CartService.checkoutCart(ctx.user!.id);
    return order;
  }
}
