import { JwtPayload } from "jsonwebtoken";

export interface ServerContext {
  user?: JwtPayload;
}
