import { ProtoCat } from "protocat";
import { ProductRegisterService } from "../../dist/api/product/product_grpc_pb";
import {
  ProductBrand,
  ProductCategory,
  ProductStatus,
  Product as ProductResponse,
  GetProductQuantityStreamResponse,
} from "../../dist/api/product/product_pb";
import * as ProductService from "../services/ProductService";
import { validate } from "class-validator";
import { ServerContext } from "../types/server-context";
import { NewProductInput, Product, ProductFilterInput, UpdateProductInput } from "../types/Products";
import { InvalidArgumentError, UnauthorizedError } from "../helper/errors";

import EventEmitter from "events";
export const productEmmiter = new EventEmitter();

export const addProductServiceRegister = (app: ProtoCat<ServerContext>) => {
  app.addService(ProductRegisterService, {
    getProduct: async (call) => {
      const productId = call.request.getId();
      const product = await ProductService.find(productId);
      call.response.setProduct(createProductResponse(product));
    },

    listProducts: async (call) => {
      const products = await ProductService.findAll(new ProductFilterInput(call.request));
      const productsResponse = createListProductsResponse(products);
      call.response.setProductsList(productsResponse);
    },

    createProduct: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const newProductInput = new NewProductInput(call.request);
      await validate(newProductInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const product = await ProductService.create(newProductInput);
      call.response.setProduct(createProductResponse(product));
    },

    updateProduct: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const updateProductInput = new UpdateProductInput(call.request);
      await validate(updateProductInput).then((errors) => {
        if (errors.length > 0) {
          throw new InvalidArgumentError("Invalid input");
        }
      });
      const product = await ProductService.update(updateProductInput.id, updateProductInput);
      productEmmiter.emit("update", product.quantity);
      call.response.setProduct(createProductResponse(product));
    },

    deleteProduct: async (call) => {
      if (!call.user || !call.user.id) {
        throw new UnauthorizedError("Unauthorized");
      }
      const productId = call.request.getId();
      await ProductService.remove(productId);
    },

    getProductQuantityStream: async (stream) => {
      const id = stream.request.getId();
      const product = await ProductService.find(id);
      const response = new GetProductQuantityStreamResponse().setQuantity(product.quantity);
      stream.write(response);
      productEmmiter.on("update", async (quantity: number | null) => {
        if (!quantity) {
          const updatedProduct = await ProductService.find(1);
          quantity = updatedProduct.quantity;
        }
        response.setQuantity(quantity);
        stream.write(response);
      });
    },
  });
};

const createProductResponse = (product: Product) => {
  return new ProductResponse()
    .setId(product.id)
    .setName(product.name)
    .setDescription(product.description)
    .setPrice(product.price)
    .setQuantity(product.quantity)
    .setStatus(new ProductStatus().setId(product.status.id).setName(product.status.name))
    .setBrand(
      new ProductBrand().setId(product.brand.id).setName(product.brand.name).setDescription(product.brand.description)
    )
    .setCategoriesList(
      product.categories.map((category) => {
        return new ProductCategory().setId(category.id).setName(category.name).setDescription(category.description);
      })
    );
};

const createListProductsResponse = (products: Product[]) => {
  return products.map((product) => {
    return createProductResponse(product);
  });
};
