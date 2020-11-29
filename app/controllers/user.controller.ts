import { Request, Response } from "express";
import Router from "express-promise-router";
import { QueryOrder, wrap } from "@mikro-orm/core";

import { DI } from "..";
import { User, UserConstructorInput } from "../entities";
import utils from "../utils";
import { MyRequest } from "../interfaces";
import { ensureAuthenticated } from "../middleware/ensureAuth";

const router = Router();

//All Users
router.get("/", async (req: Request, res: Response) => {
  const users = await DI.userRepo.findAll(
    ["books"],
    { name: QueryOrder.DESC },
    20
  );

  res.json(users);
});

router.get("/auth/me", async (req: MyRequest, res: Response) => {
  const me = await DI.userRepo.findOne({ id: req.userId });
  if (!me) {
    res.status(401);
    return res.json({
      message: "Unauthorized",
    });
  }
  return res.json(me);
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const author = await DI.userRepo.findOne(req.params.id, ["books"]);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    return res.json(author);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

//Register
router.post(
  "/",
  async (req: Request<{}, {}, UserConstructorInput>, res: Response) => {
    const data = req.body;
    if (!User.isValidUserInput(data)) {
      res.status(400);
      return res.json({
        message: "object with `firstname,lastname, email, password` missing",
      });
    }

    try {
      data.password = await User.hashPassword(data.password);
      const author = new User(data);
      wrap(author).assign(author);
      await DI.userRepo.persistAndFlush(author);

      return res.json(author);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  }
);

//Login
router.post(
  "/login",
  async (
    req: Request<{}, {}, { email?: string; password?: string }>,
    res: Response
  ) => {
    const data = req.body;
    if (!data.email || !data.password) {
      return res
        .status(400)
        .json({ message: "expected email and password to be sent" });
    }
    try {
      const user = await DI.userRepo.findOne({
        email: data.email.toLowerCase(),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValidPassword = await User.isValidPassword(
        data.password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { accessToken } = utils.createToken(user);

      return res.json({ token: accessToken, user: user });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: e.message });
    }
  }
);

//Update User
router.put("/:id", async (req: MyRequest, res: Response) => {
  try {
    const user = await DI.userRepo.findOne(req.params.id);
    const body = req.body || {};
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const FORBIDEN_KEYS = ["id", "createdAt", "updatedAt", "isAdmin", "books"];

    for (let key of FORBIDEN_KEYS) {
      if (typeof body[key] !== "undefined") {
        delete body[key];
      }
    }

    if (body["password"]) {
      body["password"] = await User.hashPassword(body.password);
    }
    const email = body["email"];
    if (typeof email === "string") {
      body.email = email.toLowerCase();
    }

    wrap(user).assign(body);
    await DI.userRepo.persistAndFlush(user);

    return res.json(user);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

export const UserController = router;
