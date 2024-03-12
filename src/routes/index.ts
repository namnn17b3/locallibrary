import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { BaseRoute } from './base.route';

@injectable()
export class RootRoute extends BaseRoute {
  constructor() {
    super();
    this.router = express.Router();

    // Handle the GET request to "/"
    this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.render('index');
    });
  }
}
