import { QueryOrder, wrap } from "@mikro-orm/core";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  Info,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { DI } from "..";
import { Book } from "../entities/Book";
import { TakeSkipArgs } from "./ArgsAndInputs";
import { UserRoles } from "../interfaces";
import { ContextType } from "../index";
import { BookTag } from "../entities";
import { isInInfo } from "./resolverUtils";

@InputType()
class UpdateBookInput {
  @Field(() => String, { nullable: true })
  title?: string;
  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
class CreateBookInput {
  @Field(() => String)
  title!: string;
}

@Resolver(Book)
export class BookResolver {
  @Query(() => Book, { nullable: true })
  async getBook(
    @Info() info: Record<any, any>,
    @Arg("id") id: string
  ): Promise<Book | null> {
    const includeAuthor = isInInfo(info, "author");
    const includeTags = isInInfo(info, "tags");

    const populate = [];

    if (includeAuthor) {
      populate.push("author");
    }
    if (includeTags) {
      populate.push("tags");
    }
    const book = await DI.bookRepository.findOne(id, populate);
    if (!book) {
      return null;
    }
    return book;
  }

  @Query(() => [Book])
  books(@Info() info: Record<any, any>, @Args() { skip, take }: TakeSkipArgs) {
    const includeAuthor = isInInfo(info, "author");
    const includeTags = isInInfo(info, "tags");

    const populate = [];

    if (includeAuthor) {
      populate.push("author");
    }
    if (includeTags) {
      populate.push("tags");
    }

    return DI.bookRepository.findAll(
      populate,
      { title: QueryOrder.DESC },
      take,
      skip
    );
  }

  @Authorized(UserRoles.CLIENT)
  @Mutation(() => Book)
  async createBook(
    @Ctx() { req }: ContextType,
    @Arg("data") { title }: CreateBookInput
  ): Promise<Book> {
    if (!req.userId) {
      throw new Error("THIS SHOULD NEVER HAPPEN.");
    }
    const author = await DI.userRepo.findOne({
      id: req.userId,
    });

    if (!author) {
      throw new Error(`User with id ${req.userId} not found`);
    }

    try {
      const book = new Book(title, req.userId as any);
      wrap(book).assign(book, { em: DI.orm.em });
      await DI.bookRepository.persistAndFlush(book);

      return book;
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw e;
      } else {
        throw new Error("Internal Server Error");
      }
    }
  }

  @Mutation(() => Book, { nullable: true })
  async updateBook(
    @Arg("data") data: UpdateBookInput,
    @Arg("id") id: string
  ): Promise<Book | null> {
    try {
      const book = await DI.bookRepository.findOne(id, ["tags"]);

      if (!book) {
        return null;
      }

      const UPDATABLEKEYS = ["title", "tags"] as const;

      const updates: Partial<Omit<Book, "tags"> & { tags: BookTag[] }> = {};

      for (let key of UPDATABLEKEYS) {
        const current = data[key];
        if (typeof current !== "undefined") {
          if (key === "tags") {
            if (Array.isArray(current)) {
              const currentTags = book.tags.get();
              const tags: BookTag[] = [...currentTags];
              for (let t of current as string[]) {
                tags.push(new BookTag(t));
              }
              updates["tags"] = tags;
            }
          } else {
            updates[key] = current as Book[typeof key];
          }
        }
      }

      wrap(book).assign(updates);
      await DI.bookRepository.persistAndFlush(book);

      return book;
    } catch (e) {
      return null;
    }
  }
}
