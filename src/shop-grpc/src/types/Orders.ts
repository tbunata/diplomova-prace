import { IsNumber, IsNotEmpty } from "class-validator";
import { UpdateOrderStatusRequest } from "../../dist/api/order/order_pb";

export class OrderItem {
  id: number;

  productId: number;

  name: string;

  description: string;

  price: number;

  quantity: number;
}

class OrderStatus {
  id: number;

  name: string;
}

export class Order {
  id: number;

  userId: number;

  created: Date;

  updated: Date;

  status: OrderStatus;

  price: number;

  items: OrderItem[];
}

export class UpdateOrderStatusInput {
  constructor(request: UpdateOrderStatusRequest) {
    this.id = request.getId();
    this.statusId = request.getStatusId();
  }

  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  statusId: number;
}
