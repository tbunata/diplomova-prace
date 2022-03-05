import { IsNotEmpty } from "class-validator";
import { CreateCategoryRequest, UpdateCategoryRequest } from "../../dist/api/category/category_pb";

export class Category {
  id: number;

  name: string;

  description: string;
}

export class NewCategoryInput {
  constructor(request: CreateCategoryRequest) {
    this.name = request.getName();
    this.description = request.getDescription();
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
}

export class UpdateCategoryInput {
  constructor(request: UpdateCategoryRequest) {
    this.id = request.getId();
    this.name = request.getName();
    this.description = request.getDescription();
  }

  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
}
