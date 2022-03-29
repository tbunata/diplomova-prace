import express, { Request, Response } from "express";
import * as CartService from "./service";
import { NewCartItemInput, UpdateCartItemInput } from "./interface";
import { verifyToken } from "../middleware/auth";
import { BadRequestError, handleError } from "../helper/errors";
import { validate } from "class-validator";

export const cartsRouter = express.Router();

cartsRouter.use(verifyToken);

cartsRouter.get("/detail", async (req: Request, res: Response) => {
  try {
    const cartDetail = await CartService.find(req.user.user_id);
    return res.status(200).json(cartDetail);
  } catch (e) {
    handleError(e, res);
  }
});

cartsRouter.post("/addItem", async (req: Request, res: Response) => {
  try {
    const cartItem = new NewCartItemInput(req.body);
    await validate(cartItem).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const newItem = await CartService.addItem(req.user.user_id, cartItem);
    return res.status(201).json(newItem);
  } catch (e) {
    handleError(e, res);
  }
});

cartsRouter.put("/updateItem", async (req: Request, res: Response) => {
  try {
    const cartItem = new UpdateCartItemInput(req.body);
    await validate(cartItem).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const updatedItem = await CartService.updateItem(req.user.user_id, cartItem);
    return res.status(201).json(updatedItem);
  } catch (e) {
    handleError(e, res);
  }
});

cartsRouter.delete("/clearCart", async (req: Request, res: Response) => {
  try {
    await CartService.clearCart(req.user.user_id);
    return res.status(204).send("Cart cleared");
  } catch (e) {
    handleError(e, res);
  }
});

cartsRouter.post("/checkout", async (req: Request, res: Response) => {
  try {
    const order = await CartService.checkoutCart(req.user.user_id);
    return res.status(200).json(order);
  } catch (e) {
    handleError(e, res);
  }
});
