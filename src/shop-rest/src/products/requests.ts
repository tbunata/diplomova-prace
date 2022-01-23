import { Request } from "express"

export interface GetProductsRequest extends Request {
    query: {
        minPrice: string | undefined
        maxPrice: string | undefined
        productIds: string[] | undefined
    }
}