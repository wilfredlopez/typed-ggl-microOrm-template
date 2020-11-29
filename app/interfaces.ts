import { Request } from "express";
import { User } from "./entities/User";

export interface MyRequest<
  P = Request["params"],
  ResBody = any,
  ReqBody = any,
  ReqQuery = Request["query"]
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId?: string;
  email?: string;
  admin?: User;
}
