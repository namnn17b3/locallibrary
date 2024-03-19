import express from 'express';
import { BookController } from '../controllers/book.controller';
import { inject, injectable } from 'tsyringe';
import { BaseRoute } from './base.route';

@injectable()
export class BookRoute extends BaseRoute {
  constructor(
    @inject(BookController) private readonly bookController: BookController,
  ) {
    super();
    this.router = express.Router();

    this.router.put(
      '/update/:id',
      this.bookController.bookUpdatePost.bind(this.bookController),
    );
    this.router.get(
      '/update/:id',
      this.bookController.bookUpdateGet.bind(this.bookController),
    );

    this.router.delete(
      '/remove/:id',
      this.bookController.bookDeletePost.bind(this.bookController),
    );
    this.router.get(
      '/delete/:id',
      this.bookController.bookDeleteGet.bind(this.bookController),
    );

    this.router.post(
      '/store',
      this.bookController.bookCreatePost.bind(this.bookController),
    );
    this.router.get(
      '/new',
      this.bookController.bookCreateGet.bind(this.bookController),
    );

    this.router.get(
      '/:id',
      this.bookController.bookDetail.bind(this.bookController),
    );
    this.router.get(
      '/',
      this.bookController.bookList.bind(this.bookController),
    );
  }
}
