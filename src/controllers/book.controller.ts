import { Request, Response, NextFunction } from 'express';
import { BookInstanceStatus } from '../utils/constants';
import { inject, injectable } from 'tsyringe';
import { BookRepository } from '../repositories/book.repository';
import { AuthorRepository } from '../repositories/author.repository';
import { GenreRepository } from '../repositories/genre.repository';
import { BookInstanceRepository } from '../repositories/bookinstance.repository';
import { BookGenreRepository } from '../repositories/bookgenre.repository';
import { catchError } from '../decorators/catcherror.decorators';

@injectable()
export class BookController {
  constructor(
    @inject(BookRepository)
    private readonly bookRepository: BookRepository,

    @inject(AuthorRepository)
    private readonly authorRepository: AuthorRepository,

    @inject(GenreRepository)
    private readonly genreRepository: GenreRepository,

    @inject(BookInstanceRepository)
    private readonly bookInstanceRepository: BookInstanceRepository,

    @inject(BookGenreRepository)
    private readonly bookGenreRepository: BookGenreRepository,
  ) {}

  @catchError()
  public async index(req: Request, res: Response, next: NextFunction) {
    // Get details of books, book instances, authors, and genre counts (in parallel)
    const [
      numBooks,
      numBookInstances,
      numAvailableBookInstances,
      numAuthors,
      numGenres,
    ] = await Promise.all([
      this.bookRepository.count(),
      this.bookInstanceRepository.count(),
      this.bookInstanceRepository.count({
        where: { status: BookInstanceStatus.Available },
      }),
      this.authorRepository.count(),
      this.genreRepository.count(),
    ]);

    res.render('index', {
      book_count: numBooks,
      book_instance_count: numBookInstances,
      book_instance_available_count: numAvailableBookInstances,
      author_count: numAuthors,
      genre_count: numGenres,
    });
  }
}
