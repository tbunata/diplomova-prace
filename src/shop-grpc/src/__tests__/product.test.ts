import { PrismaClient } from "@prisma/client";
import { createClient } from "protocat";
import { ChannelCredentials } from "@grpc/grpc-js";
import { ProductRegisterClient } from "../../dist/api/product/product_grpc_pb";
import { UserRegisterClient } from "../../dist/api/user/user_grpc_pb";
import { Product as ProductResponse } from "../../dist/api/product/product_pb";
import { app } from "../app";

const prisma = new PrismaClient();
const ADDRESS = "0.0.0.0:3334";
let client = createClient(
  {
    product: ProductRegisterClient,
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

const createProductFromResponse = (product: ProductResponse) => {
  return {
    id: product.getId(),
    name: product.getName(),
    description: product.getDescription(),
    price: product.getPrice(),
    quantity: product.getQuantity(),
    categories: product.getCategoriesList().map((category) => {
      return {
        id: category.getId(),
        name: category.getName(),
        description: category.getDescription(),
      };
    }),
    brand: {
      id: product.getBrand()?.getId(),
      name: product.getBrand()?.getName(),
      description: product.getBrand()?.getDescription(),
    },
    status: {
      id: product.getStatus()?.getId(),
      name: product.getStatus()?.getName(),
    },
  };
};

const productToFetch = {
  id: 1,
  name: "Burnished-Leather Jacket",
  description: "Orlando Oxfords' leather jacket",
  quantity: 12,
  categories: [
    {
      id: 1,
      name: "Men",
      description: "Products designed for men",
    },
    {
      id: 4,
      name: "Jackets",
      description: "For tough weather",
    },
  ],
  status: {
    id: 1,
    name: "New",
  },
  price: 2415,
  brand: {
    id: 1,
    name: "Kingsman",
    description: "High end clothing for men",
  },
};

const productToCreate = {
  id: 4,
  name: "White shirt",
  description: "A really white shirt",
  quantity: 6,
  categories: [
    {
      id: 1,
      name: "Men",
      description: "Products designed for men",
    },
  ],
  status: {
    id: 1,
    name: "New",
  },
  price: 999,
  brand: {
    id: 2,
    name: "Stronginthearm & son",
    description: "Weapons for everyday use",
  },
};

describe("listProducts", () => {
  it("should get a list of products", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.product.listProducts((req, metadata) => {
      metadata.set("authorization", token);
    });

    expect(response.getProductsList().length).toBe(3);
    const firstProduct = createProductFromResponse(response.getProductsList()[0]);
    expect(firstProduct).toEqual(productToFetch);
  });
  it("should get a filtered list of products", async () => {
    const { response } = await client.product.listProducts((req, metadata) => {
      req.setMinPrice(20);
      req.setMaxPrice(100);
    });
    expect(response.getProductsList().length).toBe(1);
    const filteredProduct = createProductFromResponse(response.getProductsList()[0]);
    expect(filteredProduct.name).toBe("Striped Cotton-Blend Socks");
    expect(filteredProduct.price).toBe(25);
    expect(filteredProduct.quantity).toBe(37);
  });
});

describe("getProduct", () => {
  it("should get a single product", async () => {
    const { response } = await client.product.getProduct((req, metadata) => {
      req.setId(1);
    });
    const fetchedProduct = createProductFromResponse(response.getProduct()!);
    expect(fetchedProduct).toEqual(productToFetch);
  });
  it("should return error for not finding product", async () => {
    await client.product
      .getProduct((req, metadata) => {
        req.setId(404);
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("5 NOT_FOUND: Product with id: 404 not found");
      });
  });
});

describe("createProduct", () => {
  it("should create a product", async () => {
    const inputData = {
      name: "White shirt",
      description: "A really white shirt",
      price: 999,
      quantity: 6,
      categoryIds: [1],
      brandId: 2,
      statusId: 1,
    };

    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.product.createProduct((req, metadata) => {
      metadata.set("authorization", token);
      req.setName(inputData.name);
      req.setDescription(inputData.description);
      req.setPrice(inputData.price);
      req.setQuantity(inputData.quantity);
      req.setCategoryIdsList(inputData.categoryIds);
      req.setBrandId(inputData.brandId);
      req.setStatusId(inputData.statusId);
    });
    const createdProduct = createProductFromResponse(response.getProduct()!);
    expect(createdProduct).toEqual(productToCreate);
  });
});

describe("MUTATION updateProduct", () => {
  it("should update a product", async () => {
    const inputData = {
      id: 4,
      name: "Black shirt",
      description: "When you don't want to be seen",
      price: 1999,
      quantity: 12,
      categoryIds: [2, 6],
      brandId: 1,
      statusId: 2,
    };
    const expectedProduct = {
      ...productToCreate,
      name: "Black shirt",
      description: "When you don't want to be seen",
      price: 1999,
      quantity: 12,
      categories: [
        {
          id: 2,
          name: "Women",
          description: "Products designed for women",
        },
        {
          id: 6,
          name: "Shirts",
          description: "High quality shirts from London",
        },
      ],
      status: {
        id: 2,
        name: "Used",
      },
      brand: {
        id: 1,
        name: "Kingsman",
        description: "High end clothing for men",
      },
    };

    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    const { response } = await client.product.updateProduct((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(inputData.id);
      req.setName(inputData.name);
      req.setDescription(inputData.description);
      req.setPrice(inputData.price);
      req.setQuantity(inputData.quantity);
      req.setCategoryIdsList(inputData.categoryIds);
      req.setBrandId(inputData.brandId);
      req.setStatusId(inputData.statusId);
    });
    const updatedProduct = createProductFromResponse(response.getProduct()!);
    expect(updatedProduct).toEqual(expectedProduct);
  });
  it("should return error for not finding product", async () => {
    const inputData = {
      id: 404,
      name: "Black shirt",
      description: "When you don't want to be seen",
      price: 1999,
      quantity: 12,
      categoryIds: [2, 6],
      brandId: 1,
      statusId: 2,
    };
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.product
      .updateProduct((req, metadata) => {
        metadata.set("authorization", token);
        req.setId(inputData.id);
        req.setName(inputData.name);
        req.setDescription(inputData.description);
        req.setPrice(inputData.price);
        req.setQuantity(inputData.quantity);
        req.setCategoryIdsList(inputData.categoryIds);
        req.setBrandId(inputData.brandId);
        req.setStatusId(inputData.statusId);
      })
      .then()
      .catch((e: Error) => {
        expect(e.message).toBe("5 NOT_FOUND: Product with id: 404 not found");
      });
  });
});

describe("removeProduct", () => {
  it("should remove a product", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await client.product.deleteProduct((req, metadata) => {
      metadata.set("authorization", token);
      req.setId(4);
    });

    const removedProduct = await prisma.product.findUnique({
      where: {
        id: 4,
      },
    });
    expect(removedProduct?.statusId).toBe(4);
  });
});
