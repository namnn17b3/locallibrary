import { Router } from 'express';

export class BaseRoute {
  protected router: Router;
  constructor() {}

  public getRouter() {
    return this.router;
  }
}
