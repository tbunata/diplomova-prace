import express, { Request, Response } from "express"
import { logger } from '../logger'
import * as UserService from "./service"
import { BaseUser, User } from "./interface"
import { verifyToken } from '../middleware/auth'

export const usersRouter = express.Router()


const handleError = (e: unknown, res: Response) => {
    logger.error(e)
    let message = "Server error"
    if (e instanceof Error) {
        message = e.message
    }
    res.status(500).send(message)
}


// GET users
usersRouter.get('/', verifyToken, async (req: Request, res: Response) => {
    try {
        const users = await UserService.findAll()
        res.status(200).send(users)
    } catch (e) {
        handleError(e, res)
    }
})

//  GET user
usersRouter.get('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const user = await UserService.find(id)

        if (user) {
            return res.status(200).send(user)
        }

        res.status(404).send('User not found')
        logger.error(`GET: User with id: ${id} not found`)
    } catch (e) {
        handleError(e, res)
    }
})


//  POST user
usersRouter.post('/', async (req: Request, res: Response) => {
    try {
        const user: BaseUser = req.body
        const newUser = await UserService.create(user)

        res.status(201).json(newUser)
    } catch (e) {
        handleError(e, res)
    }
})

//  PUT user
usersRouter.put('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const userUpdate: User = req.body

        const updatedUser = await UserService.update(id, userUpdate)

        if(updatedUser) {
            return res.status(200).send(updatedUser)
        }
        
        res.status(404).send('User not found')
        logger.error(`PUT: User with id: ${id} not found`)
    } catch (e) {
        handleError(e, res)
    }
})

// DELETE user
usersRouter.delete('/:id', verifyToken, async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await UserService.remove(id)
        
        res.status(204).send('User deleted')
    } catch (e) {
        handleError(e, res)
    }
})

// LOGIN user
usersRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).send('Missing data')
        }
        const token = await UserService.login(email, password)
        if (token) {
            return res.status(200).send(token)
        }
        return res.status(401).send('Unauthorized')
    } catch (e) {
        handleError(e, res)
    }
})

// REFRESH token
usersRouter.post('/token', async (req: Request, res: Response) => {
    try {
        const {email, refreshToken} = req.body
        if (!email || !refreshToken) {
            return res.status(400).send('Missing data')
        }
        const token = await UserService.refreshToken(email, refreshToken)
        if (token) {
            return res.status(200).send(token)
        }
        return res.status(401).send('Unauthorized')
    } catch (e) {
        handleError(e, res)
    }
})