import { ProtoCat } from "protocat";
import * as UserService from "../services/UserService";
import { User as UserResponse, UserStatus, LoginUserResponse, RefreshTokenResponse } from "../../dist/api/user/user_pb";
import { LoginUserInput, NewUserInput, RefreshTokenInput, UpdateUserInput, User } from "../types/Users";
import { validate } from "class-validator";
import { ServerContext } from "../types/server-context";
import { InvalidArgumentError, UnauthorizedError } from "../helper/errors";
import { UserRegisterService } from "../../dist/api/user/user_grpc_pb";

export const addUserServiceRegister = (app: ProtoCat<ServerContext>) => {
  app.addService(UserRegisterService, {
    getUser: async (call) => {
      const userId = call.request.getId();
      const user = await UserService.find(userId);
      call.response.setUser(createUserResponse(user));
    },

    listUsers: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const users = await UserService.findAll();
      call.response.setUserList(createListUsersResponse(users));
    },

    createUser: async (call) => {
      const newUserInput = new NewUserInput(call.request);

      await validate(newUserInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const user = await UserService.create(newUserInput);
      call.response.setUser(createUserResponse(user));
    },

    updateUser: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const updateUserInput = new UpdateUserInput(call.request);

      await validate(updateUserInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const user = await UserService.update(updateUserInput.id, updateUserInput);
      call.response.setUser(createUserResponse(user));
    },

    deleteUser: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const id = call.request.getId();
      await UserService.remove(id);
    },

    loginUser: async (call) => {
      const loginUserInput = new LoginUserInput(call.request);
      await validate(loginUserInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const loginInfo = await UserService.login(loginUserInput.email, loginUserInput.password);
      call.response = new LoginUserResponse().setToken(loginInfo.token).setRefreshToken(loginInfo.refreshToken);
    },

    refreshToken: async (call) => {
      const refreshTokenInput = new RefreshTokenInput(call.request);
      await validate(refreshTokenInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const loginInfo = await UserService.refreshToken(refreshTokenInput.email, refreshTokenInput.refreshToken);
      call.response = new RefreshTokenResponse().setToken(loginInfo.token);
    },
  });
};

const createUserResponse = (user: User) => {
  const userResponse = new UserResponse()
    .setId(user.id)
    .setEmail(user.email)
    .setFirstName(user.firstName)
    .setLastName(user.lastName)
    .setStatus(new UserStatus().setId(user.status.id).setName(user.status.name));
  if (user.phone) {
    userResponse.setPhone(user.phone);
  }
  if (user.address) {
    userResponse.setAddress(user.address);
  }
  if (user.city) {
    userResponse.setCity(user.city);
  }
  if (user.zipCode) {
    userResponse.setZipCode(user.zipCode);
  }
  return userResponse;
};

const createListUsersResponse = (users: User[]) => {
  return users.map((user) => {
    return createUserResponse(user);
  });
};
