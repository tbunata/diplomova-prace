import express, { Request, Response } from "express"
import * as CategoryService from "./service"
import { verifyToken } from '../middleware/auth'
import { BaseCategory, Category } from "./interface"
import { handleError } from '../helper/errors'

export const categoriesRouter = express.Router()

categoriesRouter.use(verifyToken)

// GET categories
categoriesRouter.get('/', async (req: Request, res: Response) => {
    try {
        const categories = await CategoryService.findAll()
        res.status(200).send(categories)
    } catch (e) {
        handleError(e, res)
    }
})

categoriesRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const category = await CategoryService.find(id)
        return res.status(200).send(category)
    } catch (e) {
        handleError(e, res)
    }
})

// POST category
categoriesRouter.post('/', async (req: Request, res: Response) => {
    try {
        const category: BaseCategory = req.body
        const newCategory = await CategoryService.create(category)
        return res.status(201).json(newCategory)
    } catch (e) {
        handleError(e, res)
    }
})

// PUT category
categoriesRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const categoryUpdate: Category = req.body

        const updatedCategory = await CategoryService.update(id, categoryUpdate)
        return res.status(200).send(updatedCategory)
    } catch (e) {
        handleError(e, res)
    }
})

//DELETE category
categoriesRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await CategoryService.remove(id)
        res.status(204).send('Category deleted')
    } catch (e) {
        handleError(e, res)
    }
})