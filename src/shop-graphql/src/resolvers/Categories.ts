import "reflect-metadata";
import { Resolver, Mutation, Arg, Query, Authorized } from "type-graphql";
import { Category, NewCategoryInput, UpdateCategoryInput } from "../types/Categories";
import * as CategoryService from "../services/Categories";

@Resolver(Category)
export class CategoryResolver {
  @Query((returns) => [Category])
  async allCategories() {
    const categories = await CategoryService.findAll();
    return categories;
  }

  @Query((returns) => Category, { nullable: true })
  async getCategory(@Arg("id") id: number) {
    return await CategoryService.find(id);
  }

  @Authorized()
  @Mutation((returns) => Category)
  async addCategory(@Arg("newCategoryData") newCategoryData: NewCategoryInput) {
    return await CategoryService.create(newCategoryData);
  }

  @Authorized()
  @Mutation((returns) => Category, { nullable: true })
  async updateCategory(@Arg("id") id: number, @Arg("updateCategoryData") updateCategoryData: UpdateCategoryInput) {
    return await CategoryService.update(id, updateCategoryData);
  }

  @Authorized()
  @Mutation((returns) => Boolean)
  async removeCategory(@Arg("id") id: number) {
    await CategoryService.remove(id);
    return true;
  }
}
