import "reflect-metadata";
import { Options, ReflectMetadataProvider } from "@mikro-orm/core";
import { MongoHighlighter } from "@mikro-orm/mongo-highlighter";
import { User, Book, BookTag, Publisher } from "./entities";
import { MONGOURL } from "./env";

const options: Options = {
  type: "mongo",
  entities: [User, Book, BookTag, Publisher],
  clientUrl: MONGOURL,
  highlighter: new MongoHighlighter(),
  metadataProvider: ReflectMetadataProvider,
  debug: process.env.NODE_ENV === "development",
};

export default options;
