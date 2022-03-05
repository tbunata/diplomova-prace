import { IsEmail, IsNotEmpty } from "class-validator";
import {
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
  RefreshTokenRequest,
} from "../../dist/api/user/user_pb";

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
  constructor(userRequest: CreateUserRequest) {
    this.email = userRequest.getEmail();
    this.password = userRequest.getPassword();
    this.firstName = userRequest.getFirstName();
    this.lastName = userRequest.getLastName();
    this.phone = userRequest.getPhone();
    this.address = userRequest.getAddress();
    this.city = userRequest.getCity();
    this.zipCode = userRequest.getZipCode();
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
  constructor(userRequest: UpdateUserRequest) {
    this.id = userRequest.getId();
    this.email = userRequest.getEmail();
    this.password = userRequest.getPassword();
    this.firstName = userRequest.getFirstName();
    this.lastName = userRequest.getLastName();
    this.phone = userRequest.getPhone();
    this.address = userRequest.getAddress();
    this.city = userRequest.getCity();
    this.zipCode = userRequest.getZipCode();
    this.statusId = userRequest.getStatusId();
  }

  @IsNotEmpty()
  id: number;

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

export class LoginUserInput {
  constructor(loginRequest: LoginUserRequest) {
    this.email = loginRequest.getEmail();
    this.password = loginRequest.getPassword();
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RefreshTokenInput {
  constructor(refreshTokenRequest: RefreshTokenRequest) {
    this.email = refreshTokenRequest.getEmail();
    this.refreshToken = refreshTokenRequest.getRefreshToken();
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  refreshToken: string;
}
