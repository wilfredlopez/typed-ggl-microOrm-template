import "reflect-metadata";
import express from "express";
import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from "@mikro-orm/core";

import { UserController, BookController } from "./controllers";
import { User, Book } from "./entities";
import { authMiddleware } from "./middleware/authMiddleware";

export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepo: EntityRepository<User>;
  bookRepository: EntityRepository<Book>;
};

const app = express();
const port = process.env.PORT || 5000;

(async () => {
  DI.orm = await MikroORM.init();
  DI.em = DI.orm.em;
  DI.userRepo = DI.orm.em.getRepository(User);
  DI.bookRepository = DI.orm.em.getRepository(Book);

  //Middleware
  app.use(express.json());
  app.use((_req, _res, next) => RequestContext.create(DI.orm.em, next));
  app.use(authMiddleware);

  //Controllers
  app.get("/", (_req, res) =>
    res.json({
      message: "Welcome!. try CRUD on /user and /book endpoints!",
    })
  );

  app.use("/user", UserController);
  app.use("/book", BookController);

  //404
  app.use((_req, res) => res.status(404).json({ message: "No route found" }));

  app.listen(port, () => {
    console.log(`app listening on http://localhost:${port}`);
  });
})();
