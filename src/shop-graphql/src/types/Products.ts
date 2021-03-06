import "reflect-metadata";
import { ObjectType, Field, InputType, Int, ArgsType } from "type-graphql";

@ObjectType()
class ProductStatus {
  @Field()
  id: number;

  @Field()
  name: string;
}

@ObjectType()
class ProductBrand {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;
}

@ObjectType()
export class ProductCategory {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;
}

@ObjectType()
export class Product {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  quantity: number;

  @Field((type) => [ProductCategory])
  categories: ProductCategory[];

  @Field()
  brand: ProductBrand;

  @Field()
  status: ProductStatus;
}

@InputType()
export class ProductFilterInput {
  @Field((type) => [Int], { nullable: true })
  ids: number[];

  @Field({ nullable: true })
  minPrice: number;

  @Field({ nullable: true })
  maxPrice: number;
}

@InputType()
export class NewProductInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  quantity: number;

  @Field((type) => [Int])
  categoryIds: number[];

  @Field()
  brandId: number;

  @Field()
  statusId: number;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  price: number;

  @Field({ nullable: true })
  quantity: number;

  @Field((type) => [Int], { nullable: true })
  categoryIds: number[];

  @Field({ nullable: true })
  brandId: number;

  @Field({ nullable: true })
  statusId: number;
}

@ArgsType()
export class QuantityUpdateArgs {
  @Field((type) => [Int], { nullable: true })
  productIds: number[];
}
