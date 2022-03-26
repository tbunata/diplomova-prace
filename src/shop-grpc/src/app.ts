import { ProtoCat } from "protocat";
import { authMdw } from "./auth/auth";
import {
  BadRequestError,
  InvalidArgumentError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "./helper/errors";
import { addCartServiceRegister } from "./registers/CartRegister";
import { addCategoryServiceRegister } from "./registers/CategoryRegister";
import { addOrderServiceRegister } from "./registers/OrderRegister";
import { addProductServiceRegister } from "./registers/ProductRegister";
import { addUserServiceRegister } from "./registers/UserRegister";
import { ServerContext } from "./types/server-context";
import { status } from "@grpc/grpc-js";

export const app = new ProtoCat<ServerContext>();

app.use(authMdw);
app.use(async (call, next) => {
  try {
    await next();
  } catch (e: any) {
    let statusCode = status.UNKNOWN;
    if (e instanceof BadRequestError || e instanceof InvalidArgumentError) {
      statusCode = status.INVALID_ARGUMENT;
    } else if (e instanceof NotFoundError) {
      statusCode = status.NOT_FOUND;
    } else if (e instanceof UnauthorizedError) {
      statusCode = status.PERMISSION_DENIED;
    } else if (e instanceof UnprocessableEntityError) {
      statusCode = status.FAILED_PRECONDITION;
    }

    call.initialMetadata.set("error-code", String(statusCode));
    call.trailingMetadata.set("error-code", String(statusCode));
    e.code = statusCode;
    throw e;
  }
});

app.use((call, next) => {
  console.log(`[${call.type}] ${call.path}`);
  return next();
});

addCartServiceRegister(app);
addCategoryServiceRegister(app);
addOrderServiceRegister(app);
addProductServiceRegister(app);
addUserServiceRegister(app);
