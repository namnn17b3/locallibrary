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
      '/',
      this.authorController.authorList.bind(this.authorController),
    );
  }
}
