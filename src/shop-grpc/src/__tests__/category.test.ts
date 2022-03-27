import { PrismaClient } from "@prisma/client";
import { createClient } from "protocat";
import { ChannelCredentials } from "@grpc/grpc-js";
import { UserRegisterClient } from "../../dist/api/user/user_grpc_pb";
import { app } from "../app";
import { CategoryRegisterClient } from "../../dist/api/category/category_grpc_pb";
import { Category as CategoryResponse } from "../../dist/api/category/category_pb";

const prisma = new PrismaClient();
const ADDRESS = "0.0.0.0:3337";
const client = createClient(
  {
    category: CategoryRegisterClient,
    user: UserRegisterClient,
  },
  ADDRESS,
  ChannelCredentials.createInsecure()
);

beforeAll(async () => {
  app.start(ADDRESS);
});

afterAll(() => app.stop());

const login = async (email: string, password: string) => {
  const { response } = await client.user.loginUser((req, metadata) => {
    req.setEmail(email);
    req.setPassword(password);
  });
  return response.getToken();
};

const createCategoryFromResponse = (category: CategoryResponse) => {
  return {
    id: category.getId(),
    name: category.getName(),
    description: category.getDescription(),
  };
};

describe("listCategories", () => {
  it("should add first item to cart", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.category.listCategories((req, metadata) => {
      metadata.set("authorization", token);
    });
    const categories = response.getCategoriesList();
    expect(categories.length).toBe(6);

    const firstCategory = createCategoryFromResponse(categories[0]);
    expect(firstCategory).toEqual({
      id: 1,
      name: "Men",
      description: "Products designed for men",
    });
  });
});

describe("getCategory", () => {
  it("should find a single category", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.category.getCategory((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(2);
    });

    const category = createCategoryFromResponse(response.getCategory()!);
    expect(category).toEqual({
      id: 2,
      name: "Women",
      description: "Products designed for women",
    });
  });
  it("should return a not found error", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.category
      .getCategory((req, metadata) => {
        metadata.set("authorization", token);
        req.setId(404);
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("5 NOT_FOUND: Category with id: 404 not found");
      });
  });
});

describe("createCategory", () => {
  it("should create a category", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.category.createCategory((req, metadata) => {
      metadata.set("authorization", token);
      req.setName("Sports");
      req.setDescription("Sports equipment ranging from golf balls to racing cars");
    });

    const category = createCategoryFromResponse(response.getCategory()!);
    expect(category).toEqual({
      id: 7,
      name: "Sports",
      description: "Sports equipment ranging from golf balls to racing cars",
    });
  });
  it("should return an invalid argument error", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.category
      .createCategory((req, metadata) => {
        metadata.set("authorization", token);
        req.setName("");
        req.setDescription("");
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("3 INVALID_ARGUMENT: Invalid input");
      });
  });
});

describe("updateCategory", () => {
  it("should update a category", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.category.updateCategory((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(7);
      req.setName("Sports2");
      req.setDescription("Sports2");
    });

    const category = createCategoryFromResponse(response.getCategory()!);
    expect(category).toEqual({
      id: 7,
      name: "Sports2",
      description: "Sports2",
    });
  });
  it("should return an invalid argument error", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.category
      .updateCategory((req, metadata) => {
        metadata.set("authorization", token);
        req.setId(7);
        req.setName("");
        req.setDescription("");
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("3 INVALID_ARGUMENT: Invalid input");
      });
  });
  it("should return a not found error", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.category
      .updateCategory((req, metadata) => {
        metadata.set("authorization", token);
        req.setId(404);
        req.setName("Sports2");
        req.setDescription("Sports2");
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("5 NOT_FOUND: Category with id: 404 not found");
      });
  });
});

describe("deleteCategory", () => {
  it("should delete a category", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.category.deleteCategory((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(7);
    });

    const category = await prisma.category.findUnique({
      where: {
        id: 7,
      },
    });

    expect(category).toBeNull();
  });
});
