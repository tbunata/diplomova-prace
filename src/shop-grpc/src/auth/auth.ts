import { Middleware } from "protocat";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ServerContext } from "../types/server-context";

export const authMdw: Middleware<ServerContext> = async function authMdw(ctx, next) {
  const token = String(ctx.metadata.get("authorization"));

  if (!token) {
    ctx.user = undefined;
  }
  try {
    const decoded = jwt.verify(token, "process.env.TOKEN_KEY") as JwtPayload;
    ctx.user = decoded;
  } catch (err) {
    ctx.user = undefined;
  }
  return next();
};
