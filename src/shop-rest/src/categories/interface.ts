export interface BaseCategory {
    name: string
    description: string
}

export interface Category extends BaseCategory {
    id: number
}