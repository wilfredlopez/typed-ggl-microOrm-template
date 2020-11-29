import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  Complexity,
} from "type-graphql";
import { User } from "../entities/User";
import { DI } from "..";
import { UserConstructorInput } from "../entities";
import { QueryOrder, wrap } from "@mikro-orm/core";
import { IsEmail, Max, Min } from "class-validator";
import { ContextType } from "../index";
import utils from "../utils";
import { UserRoles } from "../interfaces";
import { TakeSkipArgs } from "./ArgsAndInputs";
import { isInInfo } from "./resolverUtils";

class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User not found with id: ${id}`);
  }
}

@InputType()
class LoginInputType {
  @Field(() => String)
  @IsEmail()
  email!: string;
  @Field(() => String)
  password!: string;
}

@InputType()
class UpdateUserInput implements Partial<User> {
  @Field(() => String, { nullable: true })
  @IsEmail()
  email?: string;
  @Field(() => String, { nullable: true })
  password?: string;
  @Field(() => Int, { nullable: true })
  age?: number;
  @Field(() => String, { nullable: true })
  avatar?: string;
  @Field(() => String, { nullable: true })
  firstname?: string;
  @Field(() => String, { nullable: true })
  lastname?: string;
}

@ObjectType()
class LoginReturnType {
  @Field(() => String)
  token!: string;
  @Field()
  user!: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  name(@Root() parent: User) {
    return `${parent.firstname} ${parent.lastname}`;
  }

  @Authorized(UserRoles.ADMIN)
  @Query(() => User)
  async getUser(@Arg("id") id: string): Promise<User> {
    const user = await DI.userRepo.findOne(id, ["books"]);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  @Authorized(UserRoles.ADMIN)
  @Query(() => [User])
  allUsers(
    @Info() info: Record<any, any>,
    @Args() { skip, take }: TakeSkipArgs
  ) {
    let includeBooks = isInInfo(info, "books");
    const populate: string[] = [];
    if (includeBooks) {
      populate.push("books");
    }
    return DI.userRepo.findAll(populate, { name: QueryOrder.DESC }, take, skip);
  }

  @Mutation(() => User)
  async register(
    @Arg("userData") userData: UserConstructorInput
  ): Promise<User> {
    if (!User.isValidUserInput(userData)) {
      throw new Error(
        "object with `firstname,lastname, email, password` missing"
      );
    }

    userData.password = await User.hashPassword(userData.password);
    const user = new User(userData);
    wrap(user).assign(user);
    await DI.userRepo.persistAndFlush(user);

    return user;
  }

  @Authorized(UserRoles.CLIENT)
  @Query(() => User)
  async me(@Info() info: Record<any, any>, @Ctx() { req, DI }: ContextType) {
    let includeBooks = isInInfo(info, "books");

    const id = req.userId;
    if (!id) {
      throw new Error("Unauthorized");
    }

    const populate: string[] = [];
    if (includeBooks) {
      populate.push("books");
    }
    return DI.userRepo.findOne(id, populate);
  }

  @Mutation(() => LoginReturnType, { nullable: true })
  async login(
    @Info() info: Record<any, any>,
    @Arg("data", () => LoginInputType) data: LoginInputType
  ): Promise<LoginReturnType | null> {
    let includeBooks = isInInfo(info, "books");
    // if (!userData.email || !userData.password) {
    //   throw new Error()
    // }

    const populate: string[] = [];
    if (includeBooks) {
      populate.push("books");
    }
    const user = await DI.userRepo.findOne(
      {
        email: data.email.toLowerCase(),
      },
      populate
    );

    if (!user) {
      return null;
    }

    const isValidPassword = await User.isValidPassword(
      data.password,
      user.password
    );
    if (!isValidPassword) {
      return null;
    }
    const { accessToken } = utils.createToken(user);

    return { token: accessToken, user: user };
  }

  @Authorized()
  @Mutation(() => Boolean)
  async updateUser(
    @Ctx() { req }: ContextType,
    @Arg("data") data: UpdateUserInput
  ): Promise<boolean> {
    try {
      if (!req.userId) {
        return false;
      }
      const user = await DI.userRepo.findOne(req.userId);
      const body = data;
      if (!user) {
        return false;
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

      return true;
    } catch (e) {
      return false;
    }
  }
}
