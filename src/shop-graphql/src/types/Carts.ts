import "reflect-metadata";
import { ObjectType, Field, InputType } from "type-graphql";

@ObjectType()
export class Cart {
  @Field()
  id: number;

  @Field()
  userId: number;

  @Field((type) => [CartItem])
  items: CartItem[];

  @Field()
  totalPrice: number;
}

@ObjectType()
export class CartItem {
  @Field()
  id: number;

  @Field()
  productId: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  price: string;

  @Field()
  quantity: number;
}

@InputType()
export class NewCartItemInput {
  @Field()
  productId: number;

  @Field()
  quantity: number;
}

@InputType()
export class UpdateCartItemInput {
  @Field()
  productId: number;

  @Field()
  quantity: number;
}
