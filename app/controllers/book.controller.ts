import { Request, Response } from "express";
import Router from "express-promise-router";
import { QueryOrder, wrap } from "@mikro-orm/core";
import { DI } from "..";
import { Book, BookTag } from "../entities";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const books = await DI.bookRepository.findAll(
    ["author"],
    { title: QueryOrder.DESC },
    20
  );
  res.json(books);
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const book = await DI.bookRepository.findOne(req.params.id, [
      "author",
      "tags",
    ]);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json(book);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  if (!req.body.title || !req.body.author) {
    res.status(400);
    return res.json({ message: "One of `title, author` is missing" });
  }

  const { title, author: authorId } = req.body as {
    title: string;
    author: string;
  };

  const author = await DI.userRepo.findOne({
    id: authorId,
  });

  if (!author) {
    res.status(400);
    return res.json({ message: `User with id ${authorId} not found` });
  }

  try {
    const book = new Book(title, authorId as any);
    wrap(book).assign(book, { em: DI.orm.em });
    await DI.bookRepository.persistAndFlush(book);

    return res.json(book);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(400).json({ message: e.message });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

router.put(
  "/:id",
  async (req: Request<{ id: string }, {}, Partial<Book>>, res: Response) => {
    try {
      const book = await DI.bookRepository.findOne(req.params.id, ["tags"]);

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const UPDATABLEKEYS = ["title", "tags"] as const;

      const updates: Partial<Omit<Book, "tags"> & { tags: BookTag[] }> = {};

      for (let key of UPDATABLEKEYS) {
        const current = req.body[key] as Book[typeof key];
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

      return res.json(book);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  }
);

export const BookController = router;
