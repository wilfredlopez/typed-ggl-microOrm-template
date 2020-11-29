import { NextFunction, Response } from "express";
import { MyRequest } from "../interfaces";
import findWithBearerToken from "./findWithBearerToken";

//WITH THIS METHOD THE USER NEEDS TO SEND THE HEADER "Authorization": "Bearer accesstokenhere"
export async function authMiddleware(
  req: MyRequest,
  _res: Response,
  next: NextFunction
) {
  const tokens = findWithBearerToken(req);
  if (tokens) {
    req.email = tokens.email;
    req.userId = tokens.userId;
  }
  next();
}
