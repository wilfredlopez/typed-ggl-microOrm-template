import { Response, NextFunction } from "express";
import { MyRequest } from "../interfaces";

export function ensureAuthenticated(
  req: MyRequest,
  res: Response,
  next: NextFunction
) {
  if (req.userId) {
    return next();
  } else {
    res
      .status(401)
      .json({
        error: "Unauthorized",
      })
      .end();
  }
}
