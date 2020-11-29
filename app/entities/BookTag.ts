import { ObjectId } from "@mikro-orm/mongodb";
import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core";
import { Book } from ".";
import { Field, ObjectType } from "type-graphql";

@Entity()
@ObjectType()
export class BookTag {
  @PrimaryKey()
  _id!: ObjectId;

  @Field()
  @SerializedPrimaryKey()
  id!: string;

  @Field()
  @Property()
  name: string;

  @ManyToMany(() => Book, (b) => b.tags)
  books: Collection<Book> = new Collection<Book>(this);

  constructor(name: string) {
    this.name = name;
  }
}
