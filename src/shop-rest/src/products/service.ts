import { PrismaClient } from '@prisma/client'
import { BaseProduct, Product } from "./interface"

const prisma = new PrismaClient()


export const findAll = async () => {
    const products = await prisma.product.findMany({
        include: {
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
    })
    return products
}

export const find = async (id: number) => {
    const product = await prisma.product.findUnique({
        where: {
            id: id
        },
        include: {
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
    })
    return product
}

export const create = async (newProduct: BaseProduct) => {
    const product = await prisma.product.create({
        data: {
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
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
        include: {
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
        return null
    }
    const updatedProduct = await prisma.product.update({
        where: {
            id: id
        },
        data: {
            name: productUpdate.name,
            description: productUpdate.description,
            price: productUpdate.price,
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
        include: {
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
        return
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
}