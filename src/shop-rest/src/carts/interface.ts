import { IsNumber, IsNotEmpty, Min } from "class-validator";

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalPrice: number;
}

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export class NewCartItemInput {
  constructor(request: any) {
    this.productId = request.productId;
    this.quantity = request.quantity;
  }

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemInput {
  constructor(request: any) {
    this.productId = request.productId;
    this.quantity = request.quantity;
  }

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
