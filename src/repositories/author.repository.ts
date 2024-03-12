import { BaseRepository } from './base.repository';
import { Author } from '../entities/Author';
import { injectable } from 'tsyringe';

@injectable()
export class AuthorRepository extends BaseRepository<Author> {
  constructor() {
    super(Author);
  }
}
