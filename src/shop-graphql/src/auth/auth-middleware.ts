import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

declare global {
    namespace Express {
        export interface Request {
            user?: JwtPayload
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-access-token'] || req.body.token || req.query.token
    try {
        const decoded = jwt.verify(token, 'process.env.TOKEN_KEY') as JwtPayload
        req.user = decoded
    } catch (err) {
        req.user = undefined
    }
    return next()
}
