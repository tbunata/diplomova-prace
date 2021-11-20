import express, { Request, Response } from "express"
import * as UserService from "./users.service"
import { BaseUser, User } from "./user.interface"

export const usersRouter = express.Router()


// GET users

usersRouter.get('/', async (req: Request, res: Response) => {
    try {
        const users = await UserService.findAll()
        res.status(200).send(users)
    } catch (e) {
        let message = "Server error"
        if (e instanceof Error) {
            message = e.message
        }
        res.status(500).send(message)
    }
})

//  GET user
usersRouter.get('/:id', async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10)
    try {
        const user: User | null = await UserService.find(id)

        if (user) {
            return res.status(200).send(user)
        }

        res.status(404).send('User not found')
    } catch (e) {
        let message = "Server error"
        if (e instanceof Error) {
            message = e.message
        }
        res.status(500).send(message)
    }
})


//  POST user
usersRouter.post('/', async (req: Request, res: Response) => {
    try {
        const user: BaseUser = req.body
        const newUser = await UserService.create(user)

        res.status(201).json(newUser)
    } catch (e) {
        let message = "Server error"
        if (e instanceof Error) {
            message = e.message
        }
        res.status(500).send(message)
    }
})

//  PUT user
usersRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)
        const userUpdate: User = req.body

        const updatedUser = await UserService.update(id, userUpdate)

        if(updatedUser) {
            return res.status(200).send(updatedUser)
        }
        
        res.status(404).send('User not found')
    } catch (e) {
        let message = "Server error"
        if (e instanceof Error) {
            message = e.message
        }
        
        res.status(500).send(message)
    }
})

// DELETE user
usersRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id: number = parseInt(req.params.id, 10)

        await UserService.remove(id)
        
        res.status(204).send('User deleted')
    } catch (e) {
        let message = "Server error"
        if (e instanceof Error) {
            message = e.message
        }
        
        res.status(500).send(message)
    }
})