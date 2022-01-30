import express, { Request, Response} from "express"
import * as CartService from "./service"
import { BaseCartItem } from "./interface"
import { verifyToken } from '../middleware/auth'
import { handleError } from '../helper/errors'

export const cartsRouter = express.Router()

cartsRouter.use(verifyToken)

cartsRouter.get("/detail", async (req: Request, res: Response) => {
    try {
        const cartDetail = await CartService.detail(req.user.user_id)
        return res.status(200).json(cartDetail)
    } catch (e) {
        handleError(e, res)
    }
})

cartsRouter.post("/addItem", async (req: Request, res: Response) => {
    try {
        const cartItem: BaseCartItem = req.body
        if(cartItem.quantity <= 0) {
            return res.status(400).send("Quantity must be greater than zero")
        }
        const newItem = await CartService.addItem(req.user.user_id, cartItem)
        return res.status(201).json(newItem)
    } catch (e) {
        handleError(e, res)
    }
})

cartsRouter.put("/updateItem", async (req: Request, res: Response) => {
    try {
        const cartItem: BaseCartItem = req.body
        const updatedItem = await CartService.updateItem(req.user.user_id, cartItem)
        return res.status(201).json(updatedItem)
    } catch (e) {
        handleError(e, res)
    }
})

cartsRouter.delete("/clearCart", async (req: Request, res: Response) => {
    try {
        await CartService.clearCart(req.user.user_id)
        return res.status(204).send("Cart cleared")
    } catch (e) {
        handleError(e, res)
    }
})

cartsRouter.post("/checkout", async (req: Request, res: Response) => {
    try {
        const order = await CartService.checkoutCart(req.user.user_id)
        return res.status(200).json(order)
    } catch (e) {
        handleError(e, res)
    }
})