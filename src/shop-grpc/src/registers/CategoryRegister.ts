import { ProtoCat } from "protocat";
import { CategoryRegisterService } from "../../dist/api/category/category_grpc_pb";
import { Category as CategoryResponse } from "../../dist/api/category/category_pb";
import * as CategoryService from "../services/CategoryService";
import { validate } from "class-validator";
import { ServerContext } from "../types/server-context";
import { Category, NewCategoryInput, UpdateCategoryInput } from "../types/Categories";
import { InvalidArgumentError, UnauthorizedError } from "../helper/errors";

export const addCategoryServiceRegister = (app: ProtoCat<ServerContext>) => {
  app.addService(CategoryRegisterService, {
    getCategory: async (call) => {
      const categoryId = call.request.getId();
      const category = await CategoryService.find(categoryId);
      call.response.setCategory(createCategoryResponse(category));
    },

    listCategories: async (call) => {
      const categories = await CategoryService.findAll();
      const categoriesResponse = createListCategoriesResponse(categories);
      call.response.setCategoriesList(categoriesResponse);
    },

    createCategory: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const newCategoryInput = new NewCategoryInput(call.request);
      await validate(newCategoryInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const category = await CategoryService.create(newCategoryInput);
      call.response.setCategory(createCategoryResponse(category));
    },

    updateCategory: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const updateCategoryInput = new UpdateCategoryInput(call.request);
      await validate(updateCategoryInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const category = await CategoryService.update(updateCategoryInput.id, updateCategoryInput);
      call.response.setCategory(createCategoryResponse(category));
    },

    deleteCategory: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const categoryId = call.request.getId();
      await CategoryService.remove(categoryId);
    },
  });
};

const createCategoryResponse = (category: Category) => {
  return new CategoryResponse().setId(category.id).setName(category.name).setDescription(category.description);
};

const createListCategoriesResponse = (categories: Category[]) => {
  return categories.map((category) => {
    return createCategoryResponse(category);
  });
};
