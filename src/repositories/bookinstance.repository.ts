import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { BookInstance } from '../entities/BookInstance';

@injectable()
export class BookInstanceRepository extends BaseRepository<BookInstance> {
  constructor() {
    super(BookInstance);
  }
}
