import { IsNotEmpty } from "class-validator";

export interface Category {
  id: number;
  name: string;
  description: string;
}

export class NewCategoryInput {
  constructor(request: any) {
    this.name = request.name;
    this.description = request.description;
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
}

export class UpdateCategoryInput {
  constructor(request: any) {
    this.name = request.name;
    this.description = request.description;
  }

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
}
