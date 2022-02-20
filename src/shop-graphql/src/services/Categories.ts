import { PrismaClient } from '@prisma/client'
import { UserInputError } from 'apollo-server-errors'
import { Category, NewCategoryInput, UpdateCategoryInput } from '../types/Categories'



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
    if (!category) {
        throw new UserInputError(`Category with id: ${id} not found`)
    }
    return category
}

export const create = async (newCategoryData: NewCategoryInput) => {
    const category = await prisma.category.create({
        data: {
            name: newCategoryData.name,
            description: newCategoryData.description
        }
    })
    return category
}

export const update = async (id: number, updateCategoryData: UpdateCategoryInput) => {
    const category = await prisma.category.findUnique({
        where: {
            id: id
        }
    })
    if (!category) {
        throw new UserInputError(`Category with id: ${id} not found`)
    }
    const updatedCategory = await prisma.category.update({
        data: {
            name: updateCategoryData.name,
            description: updateCategoryData.description
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
        throw new UserInputError(`Category with id: ${id} not found`)
    }

    await prisma.$transaction([
        prisma.productCategory.deleteMany({
            where: {
                categoryId: id
            }
        }),
        prisma.category.delete({
            where: {
                id: id
            }
        })
    ]) 
}