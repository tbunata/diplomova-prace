import express, { Request, Response } from "express"
import { logger } from '../logger'
import * as ProductService from "./service"
import { verifyToken } from '../middleware/auth'
import { BaseProduct, Product } from "./interface"

export const productsRouter = express.Router()


const handleError = (e: unknown, res: Response) => {
    logger.error(e)
    let message = "Server error"
    if (e instanceof Error) {
        message = e.message
    }
    res.status(500).send(message)
}


// GET products
// TODO filtering
productsRouter.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const products = await ProductService.findAll()
        return res.status(200).send(products)
    } catch (e) {
        handleError(e, res)
    }
})

// GET product
productsRouter.get('/:id', verifyToken, async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10)
    try {
        const product = await ProductService.find(id)

        if (product) {
            return res.status(200).send(product)
        }

        logger.error(`GET: Product with id: ${id} not found`)
        return res.status(404).send('Product not found')
    } catch (e) {
        handleError(e, res)
    }
})

// POST products
productsRouter.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const product: BaseProduct = req.body
        const newProduct = await ProductService.create(product)
        return res.status(201).json(newProduct)
    } catch (e) {
        handleError(e, res)
    }
})

// PUT products
productsRouter.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const productUpdate: Product = req.body

        const updatedProduct = await ProductService.update(id, productUpdate)

        if(updatedProduct) {
            return res.status(200).send(updatedProduct)
        }
        
        logger.error(`PUT: Product with id: ${id} not found`)
        return res.status(404).send('Product not found')
    } catch (e) {
        handleError(e, res)
    }
})

//DELETE products
productsRouter.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await ProductService.remove(id)
        
        return res.status(204).send('Product deleted')
    } catch (e) {
        handleError(e, res)
    }
})