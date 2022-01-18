import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // const token = req.body.token || req.query.token || req.headers["x-access-token"]
  
    // if (!token) {
    //   return res.status(403).send("A token is required for authentication")
    // }
    // try {
    //   const decoded = jwt.verify(token, "process.env.TOKEN_KEY") as JwtPayload
    //   req.user = decoded
    // } catch (err) {
    //   return res.status(401).send("Invalid Token")
    // }
    return next()
  }
