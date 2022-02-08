import express, { Request, Response } from "express"
import * as OrderService from "./service"
import { verifyToken } from '../middleware/auth'
import { OrderStatusId } from "./interface"
import { handleError} from '../helper/errors'
export const ordersRouter = express.Router()

ordersRouter.use(verifyToken)


// GET orders
ordersRouter.get('/', async (req: Request, res: Response) => {
    try {
        const orders = await OrderService.findAll(req.user.user_id)
        return res.status(200).send(orders)
    } catch (e) {
        handleError(e, res)
    }
})

// GET order
ordersRouter.get('/:id', async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10)
    try {
        const order = await OrderService.find(id, req.user.user_id)
        return res.status(200).send(order)
    } catch (e) {
        handleError(e, res)
    }
})


// PUT order
ordersRouter.put('/:id/updateStatus', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const statusUpdate: OrderStatusId = req.body

        const updatedOrder = await OrderService.updateStatus(id, statusUpdate.statusId)
        return res.status(200).send(updatedOrder)
    } catch (e) {
        handleError(e, res)
    }
})

//DELETE order
ordersRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await OrderService.cancelOrder(id)
        return res.status(204).send("Order cancelled")
    } catch (e) {
        handleError(e, res)
    }
})
