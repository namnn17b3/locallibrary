import express from 'express';
import { inject, injectable } from 'tsyringe';
import { GenreController } from '../controllers/genre.controller';
import { BaseRoute } from './base.route';

@injectable()
export class GenreRoute extends BaseRoute {
  constructor(
    @inject(GenreController)
    private readonly genreController: GenreController,
  ) {
    super();
    this.router = express.Router();

    this.router.put(
      '/update/:id',
      this.genreController.genreUpdatePost.bind(this.genreController),
    );
    this.router.get(
      '/update/:id',
      this.genreController.genreUpdateGet.bind(this.genreController),
    );

    this.router.delete(
      '/remove/:id',
      this.genreController.genreDeletePost.bind(this.genreController),
    );
    this.router.get(
      '/delete/:id',
      this.genreController.genreDeleteGet.bind(this.genreController),
    );

    this.router.post(
      '/store',
      this.genreController.postGenreCreateForm.bind(this.genreController),
    );
    this.router.get(
      '/new',
      this.genreController.getGenreCreateForm.bind(this.genreController),
    );

    this.router.get(
      '/:id',
      this.genreController.genreDetail.bind(this.genreController),
    );
    this.router.get(
      '/',
      this.genreController.genreList.bind(this.genreController),
    );
  }
}
