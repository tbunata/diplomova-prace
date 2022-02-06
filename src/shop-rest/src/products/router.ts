import express, { Request, Response } from "express"
import { GetProductsRequest } from "./requests"
import * as ProductService from "./service"
import { verifyToken } from '../middleware/auth'
import { BaseProduct, Product } from "./interface"
import { handleError, NotFoundError } from '../helper/errors'
import { logger } from "../logger"
export const productsRouter = express.Router()

productsRouter.use(verifyToken)


// GET products
productsRouter.get('/', async (req: GetProductsRequest, res: Response) => {
    try {
        let productIds: number[] = []
        if(req.query.productIds){
            productIds = req.query.productIds.map(Number)
        }
        let minPrice = null
        if (req.query.minPrice) {
            minPrice = parseInt(req.query.minPrice, 10)
        }
        let maxPrice = null
        if (req.query.maxPrice) {
            maxPrice = parseInt(req.query.maxPrice, 10)
        }
        const products = await ProductService.findAll(productIds, minPrice, maxPrice)
        return res.status(200).send(products)
    } catch (e) {
        handleError(e, res)
    }
})

// GET product
productsRouter.get('/:id', async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10)
    try {
        const product = await ProductService.find(id)
        return res.status(200).send(product)
    } catch (e) {
        handleError(e, res)
    }
})

// POST products
productsRouter.post('/', async (req: Request, res: Response) => {
    try {
        const product: BaseProduct = req.body
        const newProduct = await ProductService.create(product)
        return res.status(201).json(newProduct)
    } catch (e) {
        handleError(e, res)
    }
})

// PUT products
productsRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const productUpdate: Product = req.body

        const updatedProduct = await ProductService.update(id, productUpdate)
        return res.status(200).send(updatedProduct)
    } catch (e) {
        handleError(e, res)
    }
})

//DELETE products
productsRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await ProductService.remove(id)
        return res.status(204).send('Product deleted')
    } catch (e) {
        handleError(e, res)
    }
})


productsRouter.ws('/:id/quantity', async (ws, req: Request) => {
    try{
        const id: number = parseInt(req.params.id, 10)
        const timer = setInterval(async () => {
                const quantity = await ProductService.getQuantity(id).catch((e) => {
                    let message = "Server error"
                    if (e instanceof NotFoundError) {
                        message = `${e.message}. Terminating connection`
                    }
                    ws.send(message)
                    ws.terminate()
                    clearInterval(timer)
                })
                const data = {
                    timestamp: Date.now(),
                    quantity: quantity
                };
                ws.send(JSON.stringify(data))
            }, 1000)
        ws.on('close', () => {
            console.log('WebSocket was closed')
        })
    } catch(e) {
        logger.error(e)
        let message = "Server error"
        if (e instanceof Error) {
            message = e.message
        }
        ws.send(`${message}. Terminating connection`)
        ws.terminate()
    }
})