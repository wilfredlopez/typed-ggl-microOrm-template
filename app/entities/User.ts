import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
  ManyToOne,
  PrimaryKey,
  SerializedPrimaryKey,
  // BaseEntity
} from "@mikro-orm/core";

import { Book } from ".";
import utils from "../utils";
import { ObjectType, Field, InputType, ID } from "type-graphql";
import { ObjectId } from "@mikro-orm/mongodb";
import { IsEmail, Length, MinLength } from "class-validator";
import { IsEmailAlreadyExists } from "../validation/isEmailAlreadyExist";

// export interface UserConstructorInput {
//   firstname: string;
//   lastname: string;
//   email: string;
//   password: string;
//   avatar?: string;
// }
@InputType()
export class UserConstructorInput {
  @Field()
  @Length(1, 255)
  firstname!: string;
  @Field()
  @Length(1, 255)
  lastname!: string;
  @Field()
  @IsEmail()
  @IsEmailAlreadyExists()
  email!: string;
  @Field()
  @MinLength(5)
  password!: string;
  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType() //type-graphql
@Entity()
export class User {
  @PrimaryKey()
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
  @Field() //type-graphql
  @Property()
  firstname: string;

  @Field() //type-graphql
  @Property()
  lastname: string;

  @Field() //type-graphql
  @Property({ hidden: true })
  password: string;

  @Field() //type-graphql
  @Property()
  avatar: string;

  @Field(() => Boolean, { defaultValue: false }) //type-graphql
  @Property({ default: false })
  isAdmin = false;

  @Field() //type-graphql
  @Property({ unique: true })
  email: string;

  @Field({ nullable: true }) //type-graphql
  @Property({ nullable: true })
  age?: number;

  @Field(() => [Book]) //type-graphql
  @OneToMany(() => Book, (b) => b.author, { cascade: [Cascade.ALL] })
  books = new Collection<Book>(this);

  @Field(() => Book) //type-graphql
  @ManyToOne(() => Book)
  favouriteBook?: Book;

  static isValidUserInput(
    input?: UserConstructorInput
  ): input is UserConstructorInput {
    if (!input) {
      return false;
    }
    const expected: (keyof Required<Omit<UserConstructorInput, "avatar">>)[] = [
      "email",
      "firstname",
      "lastname",
      "password",
    ];
    const keys = Object.keys(input) as (keyof UserConstructorInput)[];
    if (keys.length < expected.length) {
      return false;
    }

    for (let key of expected) {
      if (typeof input[key] === "undefined") {
        return false;
      }
      if (typeof input[key] !== "string") {
        return false;
      }
      if (input[key].trim() === "") {
        return false;
      }
    }

    return true;
  }

  static async hashPassword(pass: string) {
    return utils.hashPassword(pass);
  }

  static isValidPassword(password: string, correctPassword: string) {
    return utils.isValidPassword(password, correctPassword);
  }

  constructor({
    email,
    firstname,
    lastname,
    avatar,
    password,
  }: UserConstructorInput) {
    // super()
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email.toLowerCase();
    this.avatar =
      avatar ||
      "https://www.gravatar.com/avatar/00000000000000000000000000000000";
    this.password = password;
  }
}
