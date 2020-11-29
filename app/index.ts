import "reflect-metadata";
import express from "express";
import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from "@mikro-orm/core";

import { User, Book } from "./entities";
import { authMiddleware } from "./middleware/authMiddleware";
import { getShema } from "./getShema";
import { ApolloServer } from "apollo-server-express";
import MicroOrmOptions from "./mikro-orm.config";
import { MyRequest } from "./interfaces";
import { formatArgumentValidationErrors } from "./validation";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";

export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepo: EntityRepository<User>;
  bookRepository: EntityRepository<Book>;
};

const app = express();
const port = process.env.PORT || 5000;

export interface ContextType {
  DI: typeof DI;
  req: MyRequest;
}

async function bootstrap() {
  DI.orm = await MikroORM.init(MicroOrmOptions);
  DI.em = DI.orm.em;
  DI.userRepo = DI.orm.em.getRepository(User);
  DI.bookRepository = DI.orm.em.getRepository(Book);
  //Middleware
  app.use(express.json());
  app.use((_req, _res, next) => RequestContext.create(DI.orm.em, next));
  app.use(authMiddleware);

  const schema = await getShema();
  const server = new ApolloServer({
    schema,
    playground: true,
    formatError: formatArgumentValidationErrors,
    context: ({ req }): ContextType => ({
      DI: DI,
      req: req as MyRequest,
    }),
  });

  server.applyMiddleware({ app });
  app.listen({ port: port }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    )
  );
}

bootstrap().catch((e) => console.error(e));
