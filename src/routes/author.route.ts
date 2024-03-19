import express from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthorController } from '../controllers/author.controller';
import { BaseRoute } from './base.route';

// Handle the GET request to "/"

@injectable()
export class AuthorRoute extends BaseRoute {
  constructor(
    @inject(AuthorController)
    private readonly authorController: AuthorController,
  ) {
    super();
    this.router = express.Router();

    this.router.get(
      '/update/:id',
      this.authorController.authorUpdateGet.bind(this.authorController),
    );
    this.router.put(
      '/update/:id',
      this.authorController.authorUpdatePost.bind(this.authorController),
    );

    this.router.get(
      '/delete/:id',
      this.authorController.authorDeleteGet.bind(this.authorController),
    );
    this.router.delete(
      '/remove/:id',
      this.authorController.authorDeletePost.bind(this.authorController),
    );

    this.router.get(
      '/new',
      this.authorController.getAuthorCreateForm.bind(this.authorController),
    );
    this.router.post(
      '/store',
      this.authorController.postAuthorCreateForm.bind(this.authorController),
    );

    this.router.get(
      '/',
      this.authorController.authorList.bind(this.authorController),
    );

    this.router.get(
      '/:id',
      this.authorController.authorDetail.bind(this.authorController),
    );
  }
}
