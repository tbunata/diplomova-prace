import { AddCartItemRequest, UpdateCartItemRequest } from "../../dist/api/cart/cart_pb";
import { IsNumber, IsNotEmpty } from "class-validator";

export class Cart {
  id: number;

  userId: number;

  items: CartItem[];

  totalPrice: number;
}

export class CartItem {
  id: number;

  productId: number;

  name: string;

  description: string;

  price: number;

  quantity: number;
}

export class NewCartItemInput {
  constructor(request: AddCartItemRequest) {
    this.productId = request.getProductId();
    this.quantity = request.getQuantity();
  }

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class UpdateCartItemInput {
  constructor(request: UpdateCartItemRequest) {
    this.productId = request.getProductId();
    this.quantity = request.getQuantity();
  }

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
