import express, { Request, Response } from "express";
import EventEmitter from "events";
import { validate } from "class-validator";
import { GetProductsRequest } from "./requests";
import * as ProductService from "./service";
import { verifyToken } from "../middleware/auth";
import { NewProductInput, UpdateProductInput } from "./interface";
import { BadRequestError, handleError } from "../helper/errors";
import { logger } from "../logger";

export const productsRouter = express.Router();
export const productEmmiter = new EventEmitter();


// GET products
productsRouter.get("/",  async (req: GetProductsRequest, res: Response) => {
  try {
    let productIds: number[] = [];
    if (req.query.productIds) {
      productIds = req.query.productIds.map(Number);
    }
    let minPrice = null;
    if (req.query.minPrice) {
      minPrice = parseInt(req.query.minPrice, 10);
    }
    let maxPrice = null;
    if (req.query.maxPrice) {
      maxPrice = parseInt(req.query.maxPrice, 10);
    }
    const products = await ProductService.findAll(productIds, minPrice, maxPrice);
    return res.status(200).send(products);
  } catch (e) {
    handleError(e, res);
  }
});

// GET product
productsRouter.get("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
  try {
    const product = await ProductService.find(id);
    return res.status(200).send(product);
  } catch (e) {
    handleError(e, res);
  }
});

// POST products
productsRouter.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const newProductInput = new NewProductInput(req.body);
    await validate(newProductInput).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const newProduct = await ProductService.create(newProductInput);
    return res.status(201).json(newProduct);
  } catch (e) {
    handleError(e, res);
  }
});

// PUT products
productsRouter.put("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    const updateProductInput = new UpdateProductInput(req.body);
    await validate(updateProductInput).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const updatedProduct = await ProductService.update(id, updateProductInput);
    productEmmiter.emit("update");
    return res.status(200).send(updatedProduct);
  } catch (e) {
    handleError(e, res);
  }
});

//DELETE products
productsRouter.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);

    await ProductService.remove(id);
    return res.status(204).send("Product deleted");
  } catch (e) {
    handleError(e, res);
  }
});

productsRouter.ws("/:id/quantity", async (ws, req: Request) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    const quantity = await ProductService.getQuantity(id);
    const data = {
      timestamp: Date.now(),
      quantity: quantity,
    };
    ws.send(JSON.stringify(data));
    productEmmiter.on("update", async () => {
      const updatedProduct = await ProductService.find(id);
      const data = {
        timestamp: Date.now(),
        quantity: updatedProduct.quantity,
      };
      ws.send(JSON.stringify(data));
    });
  } catch (e) {
    logger.error(e);
    let message = "Server error";
    if (e instanceof Error) {
      message = e.message;
    }
    ws.send(`${message}. Terminating connection`);
    ws.terminate();
  }
});
