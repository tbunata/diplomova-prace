import { IsEmail, IsNotEmpty } from "class-validator";

interface UserStatus {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  status: UserStatus;
}

export class NewUserInput {
  constructor(userRequest: any) {
    this.email = userRequest.email;
    this.password = userRequest.password;
    this.firstName = userRequest.firstName;
    this.lastName = userRequest.lastName;
    this.phone = userRequest.phone;
    this.address = userRequest.address;
    this.city = userRequest.city;
    this.zipCode = userRequest.zipCode;
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
}

export class UpdateUserInput {
  constructor(userRequest: any) {
    this.email = userRequest.email;
    this.password = userRequest.password;
    this.firstName = userRequest.firstName;
    this.lastName = userRequest.lastName;
    this.phone = userRequest.phone;
    this.address = userRequest.address;
    this.city = userRequest.city;
    this.zipCode = userRequest.zipCode;
    this.statusId = userRequest.statusId;
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  phone: string | null;

  address: string | null;

  city: string | null;

  zipCode: string | null;

  @IsNotEmpty()
  statusId: number;
}
