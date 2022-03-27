import { IsNumber, IsNotEmpty } from "class-validator";

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface OrderStatus {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  userId: number;
  created: Date;
  updated: Date;
  status: OrderStatus;
  price: number;
  items: OrderItem[];
}

export class UpdateOrderStatusInput {
  constructor(request: any) {
    this.id = request.id;
    this.statusId = request.statusId;
  }

  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  statusId: number;
}
