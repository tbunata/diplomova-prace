import express, { Request, Response } from "express"
import { logger } from '../logger'
import * as CategoryService from "./service"
import { verifyToken } from '../middleware/auth'
import { BaseCategory, Category } from "./interface"

export const categoriesRouter = express.Router()

const handleError = (e: unknown, res: Response) => {
    logger.error(e)
    let message = "Server error"
    if (e instanceof Error) {
        message = e.message
    }
    res.status(500).send(message)
}


// GET categories
// TODO filtering
categoriesRouter.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const categories = await CategoryService.findAll()
        res.status(200).send(categories)
    } catch (e) {
        handleError(e, res)
    }
})

categoriesRouter.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const category = await CategoryService.find(id)
        if (category) {
            return res.status(200).send(category)
        }
        logger.error(`GET: Category with id: ${id} not found`)
        return res.status(404).send('Category not found')
    } catch (e) {
        handleError(e, res)
    }
})

// POST category
categoriesRouter.post('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const category: BaseCategory = req.body
        const newCategory = await CategoryService.create(category)
        return res.status(201).json(newCategory)
    } catch (e) {
        handleError(e, res)
    }
})

// PUT category
categoriesRouter.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const categoryUpdate: Category = req.body

        const updatedCategory = await CategoryService.update(id, categoryUpdate)

        if(updatedCategory) {
            return res.status(200).send(updatedCategory)
        }
        
        logger.error(`PUT: Category with id: ${id} not found`)
        return res.status(404).send('Category not found')
    } catch (e) {
        handleError(e, res)
    }
})

//DELETE category
categoriesRouter.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await CategoryService.remove(id)
        
        res.status(204).send('Category deleted')
    } catch (e) {
        handleError(e, res)
    }
})