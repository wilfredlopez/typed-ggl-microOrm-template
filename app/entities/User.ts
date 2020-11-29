import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
  ManyToOne,
} from "@mikro-orm/core";

import { Book } from ".";
import { BaseEntity } from "./BaseEntity";
import utils from "../utils";

export interface UserConstructorInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  avatar?: string;
}

@Entity()
export class User extends BaseEntity {
  @Property()
  firstname: string;

  @Property()
  lastname: string;

  @Property({ hidden: true })
  password: string;
  @Property()
  avatar: string;

  @Property({ default: false })
  isAdmin = false;

  @Property({ unique: true })
  email: string;

  @Property({ nullable: true })
  age?: number;

  @OneToMany(() => Book, (b) => b.author, { cascade: [Cascade.ALL] })
  books = new Collection<Book>(this);

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
    super();
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email.toLowerCase();
    this.avatar =
      avatar ||
      "https://www.gravatar.com/avatar/00000000000000000000000000000000";
    this.password = password;
  }
}
