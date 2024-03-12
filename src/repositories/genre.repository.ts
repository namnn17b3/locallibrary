import { BaseRepository } from './base.repository';
import { injectable } from 'tsyringe';
import { Genre } from '../entities/Genre';

@injectable()
export class GenreRepository extends BaseRepository<Genre> {
  constructor() {
    super(Genre);
  }
}
