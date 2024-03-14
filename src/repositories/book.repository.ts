import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Book } from '../entities/Book';

@injectable()
export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super(Book);
  }
}
