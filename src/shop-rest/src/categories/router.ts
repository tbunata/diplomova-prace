import express, { Request, Response } from "express";
import * as CategoryService from "./service";
import { verifyToken } from "../middleware/auth";
import { NewCategoryInput, UpdateCategoryInput } from "./interface";
import { BadRequestError, handleError } from "../helper/errors";
import { validate } from "class-validator";

export const categoriesRouter = express.Router();


// GET categories
categoriesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.findAll();
    res.status(200).send(categories);
  } catch (e) {
    handleError(e, res);
  }
});

categoriesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    const category = await CategoryService.find(id);
    return res.status(200).send(category);
  } catch (e) {
    handleError(e, res);
  }
});

// POST category
categoriesRouter.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const newCategoryInput = new NewCategoryInput(req.body);
    await validate(newCategoryInput).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const newCategory = await CategoryService.create(newCategoryInput);
    return res.status(201).json(newCategory);
  } catch (e) {
    handleError(e, res);
  }
});

// PUT category
categoriesRouter.put("/:id", verifyToken,  async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    const categoryUpdateInput = new UpdateCategoryInput(req.body);
    await validate(categoryUpdateInput).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const updatedCategory = await CategoryService.update(id, categoryUpdateInput);
    return res.status(200).send(updatedCategory);
  } catch (e) {
    handleError(e, res);
  }
});

//DELETE category
categoriesRouter.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);

    await CategoryService.remove(id);
    res.status(204).send("Category deleted");
  } catch (e) {
    handleError(e, res);
  }
});
