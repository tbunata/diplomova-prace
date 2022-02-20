import { PrismaClient } from '@prisma/client'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { NewProductInput, UpdateProductInput, Product, ProductCategory } from '../types/Products'


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

const transformProduct = (product: any) => {
    const categories: ProductCategory[] = []
    product.category.forEach( (category: any) => {
        categories.push({
            id: category.categoryId,
            name: category.category.name
        })
    })

    product.categories = categories
    return product as Product
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
    return products.map((product) => transformProduct(product))
}

export const find = async (id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        },
        include: includeRelatedTables
    })
    if (!product) {
        throw new UserInputError(`Product with id: ${id} not found`)
    }
    return transformProduct(product)
}

export const create = async (newProductInput: NewProductInput) => {
    const product = await prisma.product.create({
        data: {
            name: newProductInput.name,
            description: newProductInput.description,
            price: newProductInput.price,
            quantity: newProductInput.quantity,
            status: {
                connect: {id: newProductInput.statusId}
            },
            brand: {
                connect: {id: newProductInput.brandId}
            },
            category: {
                createMany: {
                    data: newProductInput.categoryIds.map((categoryId) => {
                        return {
                            categoryId: categoryId
                        }
                    })
                }
            }
        },
        include: includeRelatedTables
    })
    return transformProduct(product)
}

export const update = async (id: number, updateProductData: UpdateProductInput) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })

    if (!product) {
        throw new UserInputError(`Product with id: ${id} not found`)
    }
    let data: any = {
        name: updateProductData.name,
        description: updateProductData.description,
        price: updateProductData.price,
        quantity: updateProductData.quantity,
    }
    if (updateProductData.statusId !== undefined) {
        data = {
            ...data,
            status: {
                connect: {id: updateProductData.statusId}
            }
        }
    }
    if (updateProductData.brandId !== undefined) {
        data = {
            ...data,
            brand: {
                connect: {id: updateProductData.brandId}
            }
        }
    }
    if (updateProductData.categoryIds !== undefined && updateProductData.categoryIds.length > 0) {
        data = {
            ...data,
            category: {
                deleteMany: {},
                createMany: {
                    data: updateProductData.categoryIds.map((categoryId) => {
                        return {
                            categoryId: categoryId
                        }
                    })
                },

            }
        }
    }
    const updatedProduct = await prisma.product.update({
        where: {
            id: id
        },
        data: data,
        include: includeRelatedTables
    })
    return transformProduct(updatedProduct)
}


export const remove = async (id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })

    if (!product) {
        throw new UserInputError(`Product with id: ${id} not found`)
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