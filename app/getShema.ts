import { buildSchema } from "type-graphql";
import { UserResolver } from "./Resolvers/UserResolver";
import { ObjectId } from "mongodb";
import path from "path";
import { ObjectIdScalar } from "./ObjectidScalar";

import { authChecker } from "./middleware/authChecker";
import { BookResolver } from "./Resolvers/BookResolver";

export async function getShema() {
  const schema = await buildSchema({
    resolvers: [UserResolver, BookResolver],
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    validate: true,
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    authChecker: authChecker,
  });

  return schema;
}
