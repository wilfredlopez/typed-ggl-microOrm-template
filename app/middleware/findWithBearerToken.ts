import { Request } from "express";
import apiUtils from "../utils";

/**
 * Expects Request Headers
 * {
 *     Authorization: `Bearer ${TOKEN}`
 * }
 */
export default function findWithBearerToken(req: Request) {
  const bearerBeader = req.headers["authorization"];
  if (typeof bearerBeader !== "undefined") {
    try {
      //split at the space
      const bearer = bearerBeader.split(" ");

      //get token from array
      const accessToken = bearer[1];

      if (!accessToken) {
        return null;
      }

      return apiUtils.verifyToken(accessToken);
    } catch {
      return null;
    }
  }
  return null;
}
