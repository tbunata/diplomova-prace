import { ChannelCredentials } from "@grpc/grpc-js";
import { PrismaClient } from "@prisma/client";
import { createClient, metadataInterceptor } from "protocat";
import { UserRegisterClient } from "../../dist/api/user/user_grpc_pb";
import { User as UserResponse } from "../../dist/api/user/user_pb";
import { app } from "../app";
import { USER_STATUS_APPROVED, USER_STATUS_CREATED } from "../helper/constants";

const prisma = new PrismaClient();
const ADDRESS = "0.0.0.0:3333";
export let token = "";
let client = createClient(UserRegisterClient, ADDRESS, ChannelCredentials.createInsecure(), {
  interceptors: [metadataInterceptor((m) => m.set("authorization", token))],
});

const user1 = {
  id: 1,
  firstName: "Havelock",
  lastName: "Vetinari",
  email: "lord.vetinari@discworld.am",
  phone: "777 666 555",
  address: "Patrician's Palace",
  city: "Ankh-Morpork",
  zipCode: "100 00",
  status: {
    id: USER_STATUS_CREATED,
    name: "Created",
  },
};

const user2 = {
  id: 2,
  firstName: "Samuel",
  lastName: "Vimes",
  email: "samuel.vimes@discworld.am",
  phone: "111 666 222",
  address: "Ramkin residence",
  city: "Ankh-Morpork",
  zipCode: "100 01",
  status: {
    id: USER_STATUS_APPROVED,
    name: "Approved",
  },
};

const createUserFromResponse = (userResponse: UserResponse) => {
  return {
    id: userResponse.getId(),
    email: userResponse.getEmail(),
    firstName: userResponse.getFirstName(),
    lastName: userResponse.getLastName(),
    phone: userResponse.getPhone(),
    address: userResponse.getAddress(),
    city: userResponse.getCity(),
    zipCode: userResponse.getZipCode(),
    status: {
      id: userResponse.getStatus()?.getId(),
      name: userResponse.getStatus()?.getName(),
    },
  };
};

beforeAll(async () => {
  app.start(ADDRESS);

  const { response } = await client.loginUser((req, metadata) => {
    req.setEmail("lord.vetinari@discworld.am");
    req.setPassword("vetinariho");
  });
  token = response.getToken();
});

afterAll(() => app.stop());

describe("LoginUser", () => {
  it("should log a user in", async () => {
    const { status, metadata, response } = await client.loginUser((req, metadata) => {
      req.setEmail("lord.vetinari@discworld.am");
      req.setPassword("vetinariho");
    });

    expect(response.getToken()).toBeTruthy();
    expect(response.getRefreshToken).toBeTruthy();
  });
});

describe("listUsers", () => {
  it("should get a list of users", async () => {
    const { response } = await client.listUsers((req, metadata) => {});

    expect(response.getUserList().length).toBe(2);

    const firstUser = createUserFromResponse(response.getUserList()[0]);
    expect(firstUser).toEqual({
      id: 1,
      firstName: "Havelock",
      lastName: "Vetinari",
      email: "lord.vetinari@discworld.am",
      phone: "777 666 555",
      address: "Patrician's Palace",
      city: "Ankh-Morpork",
      zipCode: "100 00",
      status: {
        id: USER_STATUS_CREATED,
        name: "Created",
      },
    });

    const secondUser = createUserFromResponse(response.getUserList()[1]);
    expect(secondUser).toEqual({
      id: 2,
      firstName: "Samuel",
      lastName: "Vimes",
      email: "samuel.vimes@discworld.am",
      phone: "111 666 222",
      address: "Ramkin residence",
      city: "Ankh-Morpork",
      zipCode: "100 01",
      status: {
        id: USER_STATUS_APPROVED,
        name: "Approved",
      },
    });
  });
});

describe("getUser", () => {
  it("should get user's data", async () => {
    const { response } = await client.getUser((req, metadata) => {
      req.setId(1);
    });

    const user = createUserFromResponse(response.getUser()!);
    expect(user).toEqual({
      id: 1,
      firstName: "Havelock",
      lastName: "Vetinari",
      email: "lord.vetinari@discworld.am",
      phone: "777 666 555",
      address: "Patrician's Palace",
      city: "Ankh-Morpork",
      zipCode: "100 00",
      status: {
        id: USER_STATUS_CREATED,
        name: "Created",
      },
    });
  });
  it("should return error for not finding user", async () => {
    await client
      .getUser((req, metadata) => {
        req.setId(404);
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe(`5 NOT_FOUND: User with id: 404 not found`);
      });
  });
});

describe("createUser", () => {
  it("should create a user", async () => {
    const inputData = {
      email: "fred.colon@ankh-morpork.dw",
      firstName: "Fred",
      lastName: "Colon",
      password: "colonovo",
      phone: "+420 123123123",
      address: "City Watch",
      city: "Ankh-Morpork",
      zipCode: "101 23",
    };

    const { response } = await client.createUser((req, metadata) => {
      req.setEmail(inputData.email);
      req.setPassword(inputData.password);
      req.setFirstName(inputData.firstName);
      req.setLastName(inputData.lastName);
      req.setPhone(inputData.phone);
      req.setAddress(inputData.address);
      req.setCity(inputData.city);
      req.setZipCode(inputData.zipCode);
    });

    expect(createUserFromResponse(response.getUser()!)).toEqual({
      id: 3,
      email: "fred.colon@ankh-morpork.dw",
      firstName: "Fred",
      lastName: "Colon",
      phone: "+420 123123123",
      address: "City Watch",
      city: "Ankh-Morpork",
      zipCode: "101 23",
      status: {
        id: USER_STATUS_CREATED,
        name: "Created",
      },
    });
  });
});

describe("updateUser", () => {
  it("should update user's data", async () => {
    const inputData = {
      id: 3,
      email: "alfred.colon@ankh-morpork.dw",
      firstName: "Alfred",
      lastName: "Colon",
      password: "colonovo",
      phone: "+420 123123123",
      address: "Street no. 42",
      city: "Ankh-Morpork",
      zipCode: "123 33",
      statusId: USER_STATUS_APPROVED,
    };

    const { response } = await client.updateUser((req, metadata) => {
      req.setId(inputData.id);
      req.setEmail(inputData.email);
      req.setPassword(inputData.password);
      req.setFirstName(inputData.firstName);
      req.setLastName(inputData.lastName);
      req.setPhone(inputData.phone);
      req.setAddress(inputData.address);
      req.setCity(inputData.city);
      req.setZipCode(inputData.zipCode);
      req.setStatusId(inputData.statusId);
    });

    expect(createUserFromResponse(response.getUser()!)).toEqual({
      id: 3,
      email: "alfred.colon@ankh-morpork.dw",
      firstName: "Alfred",
      lastName: "Colon",
      phone: "+420 123123123",
      address: "Street no. 42",
      city: "Ankh-Morpork",
      zipCode: "123 33",
      status: {
        id: USER_STATUS_APPROVED,
        name: "Approved",
      },
    });
  });
});

describe("removeUser", () => {
  it("should remove a user", async () => {
    await client.deleteUser((req, metadata) => {
      req.setId(3);
    });

    const removedUser = await prisma.user.findUnique({
      where: {
        id: 3,
      },
    });
    expect(removedUser).toBeNull();
  });
});
