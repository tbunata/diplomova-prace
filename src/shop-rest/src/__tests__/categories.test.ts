import { PrismaClient } from "@prisma/client";
import supertest from "supertest";
import { app } from "../app";

const prisma = new PrismaClient();

const login = async (email: string, password: string) => {
  const loginResponse = await supertest(app).post("/users/login").send({ email: email, password: password });
  return loginResponse.body.token;
};

describe("GET /categories", () => {
  it("should find all categories", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/categories")
      .set("x-access-token", token)
      .expect(200)
      .then(async (res) => {
        expect(res.body.length).toBe(6);
        const firstCategory = res.body[0];
        expect(firstCategory.id).toBe(1);
        expect(firstCategory.name).toBe("Men");
        expect(firstCategory.description).toBe("Products designed for men");
      });
  });
});

describe("GET /categories/id", () => {
  it("should find a single category", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .get("/categories/2")
      .set("x-access-token", token)
      .expect(200)
      .then(async (res) => {
        const category = res.body;
        expect(category.id).toBe(2);
        expect(category.name).toBe("Women");
        expect(category.description).toBe("Products designed for women");
      });
  });
  it("should return a not found error", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).get("/categories/404").set("x-access-token", token).expect(404);
  });
});

describe("POST /categories", () => {
  it("should create a category", async () => {
    const newCategoryData = {
      name: "Sports",
      description: "Sports equipment ranging from golf balls to racing cars",
    };
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .post("/categories")
      .set("x-access-token", token)
      .send(newCategoryData)
      .expect(201)
      .then(async (res) => {
        const createdCategory = res.body;
        expect(createdCategory.id).toBeTruthy();
        expect(createdCategory.name).toBe("Sports");
        expect(createdCategory.description).toBe("Sports equipment ranging from golf balls to racing cars");
      });
  });
  it("should return an error for bad input", async () => {
    const invalidCategoryData = {
      name: "",
      description: "",
    };
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).post("/categories").set("x-access-token", token).send(invalidCategoryData).expect(400);
  });
});

describe("PUT /categories", () => {
  it("should update a category", async () => {
    const updateCategoryData = {
      name: "Jackets & Coats",
      description: "For tough weather",
    };
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app)
      .put("/categories/1")
      .set("x-access-token", token)
      .send(updateCategoryData)
      .expect(200)
      .then(async (res) => {
        const updatedCategory = res.body;
        expect(updatedCategory.id).toBeTruthy();
        expect(updatedCategory).toMatchObject(updateCategoryData);
      });
  });
  it("should return not found error", async () => {
    const updateCategoryData = {
      name: "Jackets & Coats",
      description: "For tough weather",
    };
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).put("/categories/404").set("x-access-token", token).send(updateCategoryData).expect(404);
  });
  it("should return an error for bad input", async () => {
    const invalidCategoryData = {
      name: "",
      description: "",
    };
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).put("/categories/1").set("x-access-token", token).send(invalidCategoryData).expect(400);
  });
});

describe("DELETE /categories/id", () => {
  it("should delete a category", async () => {
    const token = await login("lord.vetinari@discworld.am", "vetinariho");
    await supertest(app).delete("/categories/1").set("x-access-token", token).expect(204);

    const category = await prisma.category.findUnique({
      where: {
        id: 1,
      },
    });
    expect(category).toBeNull();
  });
});
