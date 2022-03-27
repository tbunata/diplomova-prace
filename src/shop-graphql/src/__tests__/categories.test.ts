import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../app";
import { Server } from "http";

const prisma = new PrismaClient();
let server: Server;

beforeAll(async () => {
  server = await createApp();
});

const loginUser = async (email: string, password: string) => {
  const loginData = {
    query: `mutation { 
            loginUser(
                email: "${email}",
                password: "${password}"
            ) {
                token,
                refreshToken
            }
        }`,
  };
  const loginResponse = await request(server).post("/graphql").send(loginData).expect(200);
  return loginResponse.body.data.loginUser;
};

describe("allCategories", () => {
  it("should find all categories", async () => {
    const queryData = {
      query: `query {
            allCategories {
                id
                name
                description
            }
        }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const categories = res.body.data.allCategories;
        expect(categories.length).toBe(6);
        expect(categories[0].id).toBe(1);
        expect(categories[0].name).toBe("Men");
        expect(categories[0].description).toBe("Products designed for men");
      });
  });
});

describe("QUERY getCategory", () => {
  it("should find a single category", async () => {
    const queryData = {
      query: `query {
                getCategory(id: 2) {
                    id
                    name
                    description
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const category = res.body.data.getCategory;
        expect(category.id).toBe(2);
        expect(category.name).toBe("Women");
        expect(category.description).toBe("Products designed for women");
      });
  });
  it("should return a not found error", async () => {
    const queryData = {
      query: "{ getCategory(id: 404) { name } }",
    };

    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.errors;
        expect(payload.length).toBe(1);
        expect(payload[0].message).toBe("Category with id: 404 not found");
      });
  });
});

describe("MUTATION addCategory", () => {
  it("should create a single category", async () => {
    const queryData = {
      query: `mutation {
                addCategory(newCategoryData: {
                    name: "Sports",
                    description: "Sports equipment ranging from golf balls to racing cars"
                }) {
                    id
                    name
                    description
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const category = res.body.data.addCategory;
        expect(category.id).toBe(7);
        expect(category.name).toBe("Sports");
        expect(category.description).toBe("Sports equipment ranging from golf balls to racing cars");
      });
  });
});

describe("MUTATION updateCategory", () => {
  it("should update a category", async () => {
    const queryData = {
      query: `mutation {
                updateCategory(
                  id: 7,  
                  updateCategoryData: {
                    name: "Sports - updated",
                    description: "Sports equipment ranging from golf balls to racing cars"
                }) {
                    id
                    name
                    description
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const category = res.body.data.updateCategory;
        expect(category.id).toBe(7);
        expect(category.name).toBe("Sports - updated");
        expect(category.description).toBe("Sports equipment ranging from golf balls to racing cars");
      });
  });
  it("should return a not found error", async () => {
    const queryData = {
      query: `mutation {
                updateCategory(
                  id: 404,  
                  updateCategoryData: {
                    name: "Sports - updated",
                    description: "Sports equipment ranging from golf balls to racing cars"
                }) {
                    id
                    name
                    description
                }
            }`,
    };
    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.errors;
        expect(payload.length).toBe(1);
        expect(payload[0].message).toBe("Category with id: 404 not found");
      });
  });
});

describe("MUTATION removeCategory", () => {
  it("should remove a category", async () => {
    const queryData = {
      query: `mutation {
                removeCategory(id: 7) 
              }`,
    };

    const loginInfo = await loginUser("lord.vetinari@discworld.am", "vetinariho");
    await request(server)
      .post("/graphql")
      .set("x-access-token", loginInfo.token)
      .send(queryData)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.data.removeCategory;
        expect(payload).toBe(true);
      });

    const removedCategory = await prisma.category.findUnique({
      where: {
        id: 7,
      },
    });
    expect(removedCategory).toBeNull();
  });
});
