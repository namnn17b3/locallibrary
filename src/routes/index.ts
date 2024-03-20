import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthorRoute } from './author.route';
import { BookController } from '../controllers/book.controller';
import { BaseRoute } from './base.route';
import { BookRoute } from './book.route';
import { GenreRoute } from './genre.route';

@injectable()
export class RootRoute extends BaseRoute {
  constructor(
    @inject(AuthorRoute)
    private readonly authorRoute: AuthorRoute,

    @inject(BookRoute)
    private readonly bookRoute: BookRoute,

    @inject(BookController)
    private readonly bookController: BookController,

    @inject(GenreRoute)
    private readonly genreRoute: GenreRoute,
  ) {
    super();
    this.router = express.Router();

    // Handle the GET request to "/"
    this.router.get('/', this.bookController.index.bind(this.bookController));
    this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.render('index');
    });

    this.router.use('/authors', this.authorRoute.getRouter());
    this.router.use('/books', this.bookRoute.getRouter());
    this.router.use('/genres', this.genreRoute.getRouter());
  }
}
