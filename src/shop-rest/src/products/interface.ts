export interface BaseProduct {
    categoryIds: categoryId[]
    name: string
    description: string
    statusId: number
    price: number
    brandId: number
    quantity: number
}

export interface Product extends BaseProduct {
    id: number
}

interface categoryId {
    categoryId: number
}