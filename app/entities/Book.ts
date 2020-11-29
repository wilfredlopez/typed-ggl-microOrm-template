import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from "@mikro-orm/core";
import { User, BookTag, Publisher } from "./index";
import { ObjectType, Field, ID } from "type-graphql";
import { ObjectId } from "@mikro-orm/mongodb";

@ObjectType()
@Entity()
export class Book {
  @PrimaryKey()
  @Field(() => ID) //type-graphql
  _id!: ObjectId;

  @Field() //type-graphql
  @SerializedPrimaryKey()
  id!: string;

  @Field(() => Date)
  @Property()
  createdAt = new Date();

  @Field(() => Date)
  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
  @Field()
  @Property()
  title: string;

  @Field(() => User)
  @ManyToOne()
  author: User;

  @ManyToOne(() => Publisher, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  publisher?: Publisher;

  @Field(() => [BookTag])
  @ManyToMany(() => BookTag)
  tags = new Collection<BookTag>(this);

  @Property({ nullable: true })
  metaObject?: object;

  @Property({ nullable: true })
  metaArray?: any[];

  @Property({ nullable: true })
  metaArrayOfStrings?: string[];

  constructor(title: string, author: User) {
    this.title = title;
    this.author = author;
  }
}
