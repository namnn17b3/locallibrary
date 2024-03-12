import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import { BookGenre } from '../entities/BookGenre';

@injectable()
export class BookGenreRepository extends BaseRepository<BookGenre> {
  constructor() {
    super(BookGenre);
  }
}
