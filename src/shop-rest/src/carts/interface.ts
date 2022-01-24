export interface BaseCartItem {
    productId: number
    quantity: number
}

export interface CartItem extends BaseCartItem{
    id: number,
    product: {
        name: string,
        description: string,
        price: number
    }
}