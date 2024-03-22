import express from 'express';
import { inject, injectable } from 'tsyringe';
import { BookInstanceController } from '../controllers/bookinstance.controller';
import { BaseRoute } from './base.route';
@injectable()
export class BookInstanceRoute extends BaseRoute {
  constructor(
    @inject(BookInstanceController)
    private readonly bookInstanceController: BookInstanceController,
  ) {
    super();
    this.router = express.Router();

    this.router.put(
      '/update/:id',
      this.bookInstanceController.bookinstanceUpdatePost.bind(
        this.bookInstanceController,
      ),
    );
    this.router.get(
      '/update/:id',
      this.bookInstanceController.bookinstanceUpdateGet.bind(
        this.bookInstanceController,
      ),
    );

    this.router.delete(
      '/remove',
      this.bookInstanceController.bookinstanceDeletePost.bind(
        this.bookInstanceController,
      ),
    );
    this.router.get(
      '/delete/:id',
      this.bookInstanceController.bookinstanceDeleteGet.bind(
        this.bookInstanceController,
      ),
    );

    this.router.post(
      '/store',
      this.bookInstanceController.bookinstanceCreatePost.bind(
        this.bookInstanceController,
      ),
    );
    this.router.get(
      '/new',
      this.bookInstanceController.bookinstanceCreateGet.bind(
        this.bookInstanceController,
      ),
    );

    this.router.get(
      '/:id',
      this.bookInstanceController.bookinstanceDetail.bind(
        this.bookInstanceController,
      ),
    );
    this.router.get(
      '/',
      this.bookInstanceController.bookinstanceList.bind(
        this.bookInstanceController,
      ),
    );
  }
}
