import express, { Request, Response } from "express";
import { validate } from "class-validator";
import * as UserService from "./service";
import { NewUserInput, UpdateUserInput } from "./interface";
import { verifyToken } from "../middleware/auth";
import { BadRequestError, handleError } from "../helper/errors";

export const usersRouter = express.Router();

// GET users
usersRouter.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const users = await UserService.findAll();
    res.status(200).send(users);
  } catch (e) {
    handleError(e, res);
  }
});

//  GET user
usersRouter.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    const user = await UserService.find(id);
    return res.status(200).send(user);
  } catch (e) {
    handleError(e, res);
  }
});

//  POST user
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const newUserInput = new NewUserInput(req.body);
    await validate(newUserInput).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const newUser = await UserService.create(newUserInput);
    res.status(201).json(newUser);
  } catch (e) {
    handleError(e, res);
  }
});

//  PUT user
usersRouter.put("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const id: number = req.user.user_id;
    const updateUserInput = new UpdateUserInput(req.body);
    await validate(updateUserInput).then((errors) => {
      if (errors.length > 0) {
        throw new BadRequestError(`Invalid input: ${errors}`);
      }
    });
    const updatedUser = await UserService.update(id, updateUserInput);
    return res.status(200).send(updatedUser);
  } catch (e) {
    handleError(e, res);
  }
});

// DELETE user
usersRouter.delete("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const id: number = req.user.user_id;

    await UserService.remove(id);
    res.status(204).send("User deleted");
  } catch (e) {
    handleError(e, res);
  }
});

// LOGIN user
usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Missing data");
    }
    const token = await UserService.login(email, password);
    return res.status(200).send(token);
  } catch (e) {
    handleError(e, res);
  }
});

// REFRESH token
usersRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { email, refreshToken } = req.body;
    if (!email || !refreshToken) {
      return res.status(400).send("Missing data");
    }
    const token = await UserService.refreshToken(email, refreshToken);
    return res.status(200).send(token);
  } catch (e) {
    handleError(e, res);
  }
});
