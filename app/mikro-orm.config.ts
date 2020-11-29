import { Options } from "@mikro-orm/core";
import { MongoHighlighter } from "@mikro-orm/mongo-highlighter";
import { User, Book, BookTag, Publisher, BaseEntity } from "./entities";
import { MONGOURL } from "./env";

const options: Options = {
  type: "mongo",
  entities: [User, Book, BookTag, Publisher, BaseEntity],
  clientUrl: MONGOURL,
  highlighter: new MongoHighlighter(),
  debug: process.env.NODE_ENV === "development",
};

export default options;
