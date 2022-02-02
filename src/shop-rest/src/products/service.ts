import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '../helper/errors'
import { BaseProduct, Product } from "./interface"

const prisma = new PrismaClient()

const includeRelatedTables = {
    category: {
        select: {
            categoryId: true,
            category: {
                select: {
                    name: true
                }
            }
        }
    },
    status: {
        select: {
            name: true
        }
    },
    brand: {
        select: {
            name: true
        }
    }
}


export const findAll = async (ids:number[]=[], minPrice:number|null, maxPrice:number|null) => {
    let where: any = {}
    if (ids.length > 0) {
        where = {
            ...where,
            id: {
                in: ids
            }
        }
    }
    let price = {}
    if (minPrice !== null) {
        price = {
            ...price,
            gte: minPrice
        }
    }
    if (maxPrice !== null) {
        price = {
            ...price,
            lte: maxPrice
        }
    }
    if (price != {}){
        where = {
            ...where,
            price
        }
    }
    let query: any = {
        include: includeRelatedTables
    }

    query = {
        ...query,
        where
    }

    const products = await prisma.product.findMany(query)
    return products
}

export const find = async (id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        },
        include: includeRelatedTables
    })
    if (!product) {
        throw new NotFoundError(`Product with id: ${id} not found`)
    }
    return product
}

export const create = async (newProduct: BaseProduct) => {
    const product = await prisma.product.create({
        data: {
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            quantity: newProduct.quantity,
            status: {
                connect: {id: newProduct.statusId}
            },
            brand: {
                connect: {id: newProduct.brandId}
            },
            category: {
                createMany: {
                    data: newProduct.categoryIds
                }
            }
        },
        include: includeRelatedTables
    })
    return product
}

export const update = async (id: number, productUpdate: Product) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })

    if (!product) {
        throw new NotFoundError(`Product with id: ${id} not found`)
    }
    const updatedProduct = await prisma.product.update({
        where: {
            id: id
        },
        data: {
            name: productUpdate.name,
            description: productUpdate.description,
            price: productUpdate.price,
            quantity: productUpdate.quantity,
            status: {
                connect: {id: productUpdate.statusId}
            },
            brand: {
                connect: {id: productUpdate.brandId}
            },
            category: {
                deleteMany: {},
                createMany: {
                    data: productUpdate.categoryIds
                },

            }
        },
        include: includeRelatedTables
    })
    return updatedProduct
}


export const remove = async (id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })

    if (!product) {
        throw new NotFoundError(`Product with id: ${id} not found`)
    }

    await prisma.$transaction([
        prisma.productCategory.deleteMany({
            where: {
                productId: id
            }
        }),
        prisma.product.delete({
            where: {
                id: id
            }
        })
    ])
    return null
}

export const getQuantity = async(id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })
    if (!product) {
        throw new NotFoundError(`Product with id: ${id} not found`)
    }
    return product.quantity
}