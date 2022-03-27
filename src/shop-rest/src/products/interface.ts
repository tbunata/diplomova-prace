import { IsNumber, IsNotEmpty } from "class-validator";

interface ProductStatus {
  id: number;
  name: string;
}
interface ProductBrand {
  id: number;

  name: string;

  description: string;
}
export interface ProductCategory {
  id: number;

  name: string;

  description: string;
}
export interface Product {
  id: number;

  name: string;

  description: string;

  price: number;

  quantity: number;

  categories: ProductCategory[];

  brand: ProductBrand;

  status: ProductStatus;
}

export class NewProductInput {
  constructor(request: any) {
    this.name = request.name;
    this.description = request.description;
    this.price = request.price;
    this.quantity = request.quantity;
    this.categoryIds = request.categoryIds;
    this.brandId = request.brandId;
    this.statusId = request.statusId;
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  categoryIds: number[];

  @IsNotEmpty()
  @IsNumber()
  brandId: number;

  @IsNotEmpty()
  @IsNumber()
  statusId: number;
}

export class UpdateProductInput {
  constructor(request: any) {
    this.name = request.name;
    this.description = request.description;
    this.price = request.price;
    this.quantity = request.quantity;
    this.categoryIds = request.categoryIds;
    this.brandId = request.brandId;
    this.statusId = request.statusId;
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  categoryIds: number[];

  @IsNotEmpty()
  @IsNumber()
  brandId: number;

  @IsNotEmpty()
  @IsNumber()
  statusId: number;
}
