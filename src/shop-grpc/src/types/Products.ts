import { CreateProductRequest, ListProductsRequest, UpdateProductRequest } from "../../dist/api/product/product_pb";
import { IsNumber, IsNotEmpty } from "class-validator";

class ProductStatus {
  id: number;

  name: string;
}
class ProductBrand {
  id: number;

  name: string;

  description: string;
}
export class ProductCategory {
  id: number;

  name: string;

  description: string;
}
export class Product {
  id: number;

  name: string;

  description: string;

  price: number;

  quantity: number;

  categories: ProductCategory[];

  brand: ProductBrand;

  status: ProductStatus;
}

export class ProductFilterInput {
  constructor(request: ListProductsRequest) {
    this.ids = request.getIdsList();
    this.minPrice = request.getMinPrice();
    this.maxPrice = request.getMaxPrice();
  }
  ids: number[];

  minPrice: number;

  maxPrice: number;
}

export class NewProductInput {
  constructor(request: CreateProductRequest) {
    this.name = request.getName();
    this.description = request.getDescription();
    this.price = request.getPrice();
    this.quantity = request.getQuantity();
    this.categoryIds = request.getCategoryIdsList();
    this.brandId = request.getBrandId();
    this.statusId = request.getStatusId();
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
  constructor(request: UpdateProductRequest) {
    this.id = request.getId();
    this.name = request.getName();
    this.description = request.getDescription();
    this.price = request.getPrice();
    this.quantity = request.getQuantity();
    this.categoryIds = request.getCategoryIdsList();
    this.brandId = request.getBrandId();
    this.statusId = request.getStatusId();
  }

  @IsNotEmpty()
  id: number;

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

export class QuantityUpdateArgs {
  productIds: number[];
}
