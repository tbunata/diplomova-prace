import { PrismaClient } from '@prisma/client'
import { BaseCategory} from "./interface"

const prisma = new PrismaClient()


export const findAll = async () => {
    const categories = await prisma.category.findMany()
    return categories
}

export const find = async (id: number) => {
    const category = await prisma.category.findUnique({
        where: {
            id: id
        }
    })
    return category
}

export const create = async (newCategory: BaseCategory) => {
    const category = await prisma.category.create({
        data: {
            name: newCategory.name,
            description: newCategory.description
        }
    })
    return category
}

export const update = async (id: number, updateCategory: BaseCategory) => {
    const category = await prisma.category.findUnique({
        where: {
            id: id
        }
    })
    if (!category) {
        return null
    }
    const updatedCategory = await prisma.category.update({
        data: {
            name: updateCategory.name,
            description: updateCategory.description
        },
        where: {
            id: id
        }
    })
    return updatedCategory
}

export const remove = async (id: number) => {
    const category = await prisma.category.findUnique({
        where: {
            id: id
        }
    })

    if (!category) {
        return
    }

    await prisma.category.delete({
        where: {
            id: id
        }
    })    
}