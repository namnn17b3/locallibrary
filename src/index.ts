import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'morgan';
import flash from 'connect-flash';
import { AppDataSource } from './config/database';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { RootRoute } from './routes';
import { StatusEnum } from './enum/status.enum';

const app = express();
const host = process.env.HOST;
const port = +process.env.PORT;

async function main() {
  try {
    await AppDataSource.initialize();
  } catch (err) {
    console.error('Error during Data Source initialization', err);
  }
  console.log('Data Source has been initialized!');
  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Parse URL-encoded and JSON bodies
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Use cookie-parser middleware
  app.use(cookieParser('keyboard cat'));
  app.use(session({ secret: undefined, cookie: { maxAge: 60000 } }));
  app.use(flash());

  // Set view engine
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // Parse cookies
  app.use(cookieParser());

  // HTTP logger
  app.use(logger('dev'));

  // Use router
  const rootRoute = container.resolve(RootRoute);
  app.use(rootRoute.getRouter());

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    switch (err.status) {
      case StatusEnum.INTERNAL_ERROR:
        res.render('error/error', {
          title: 'Error 500',
          content: '500 Internal Server Error',
        });
        break;
      default: // error when render view
        res.render('error', {
          stackTrace: err.stack,
        });
    }
  });

  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    res.status(404).render('error/error', {
      title: 'Error 404',
      content: '404 Not Found',
    });
  });

  // Start server
  app.listen(port, host, () => {
    console.log(`App listening on port ${port}`);
  });
}

main();
