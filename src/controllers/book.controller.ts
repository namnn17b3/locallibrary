import { Request, Response, NextFunction } from 'express';
import { Book } from '../entities/Book';
import { BookInstance } from '../entities/BookInstance';
import { BookInstanceStatus } from '../utils/constants';
import { BookGenre } from '../entities/BookGenre';
import { inject, injectable } from 'tsyringe';
import { BookRepository } from '../repositories/book.repository';
import { AuthorRepository } from '../repositories/author.repository';
import { GenreRepository } from '../repositories/genre.repository';
import { BookInstanceRepository } from '../repositories/bookinstance.repository';
import { BookGenreRepository } from '../repositories/bookgenre.repository';
import { catchError } from '../decorators/catcherror.decorators';
import { plainToClass } from 'class-transformer';
import { BookCreateDto } from '../dtos/book/book.create.dto';
import { validate, ValidationError } from 'class-validator';
import { convertToArray, convertToArrayError } from '../utils/utils';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';

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

  // Display list of all books.
  @catchError()
  public async bookList(req: Request, res: Response, next: NextFunction) {
    const allBooks: Book[] = await this.bookRepository.find({
      select: ['id', 'title', 'author'],
      relations: ['author'],
      order: { title: 'ASC' },
    });
    res.render('book/book_list', { book_list: allBooks });
  }

  // detail book
  @catchError()
  public async bookDetail(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const book: Book = await this.bookRepository.findOne({
      where: { id: +req.params.id },
      relations: ['author', 'bookInstances'],
    });

    if (!book) {
      req.flash('error', req.t('home.no_book'));
      res.redirect('/books');
    }

    const bookInstance: BookInstance[] = book.bookInstances;
    const genre: BookGenre[] = await this.bookGenreRepository.find({
      where: { book: book },
      relations: ['genre'],
    });

    res.render('book/book_detail', {
      book: book,
      book_instances: bookInstance,
      genre: genre,
    });
  }

  // Function to get all authors and genres
  private async getAllAuthorsAndGenres() {
    const [allAuthors, allGenres] = await Promise.all([
      this.authorRepository.find({ order: { familyName: 'ASC' } }),
      this.genreRepository.find({ order: { name: 'ASC' } }),
    ]);
    return { allAuthors, allGenres };
  }

  // GET create book
  @catchError()
  public async bookCreateGet(req: Request, res: Response, next: NextFunction) {
    const { allAuthors, allGenres } = await this.getAllAuthorsAndGenres();
    res.render('book/book_form', {
      authors: allAuthors,
      genres: allGenres,
    });
  }

  // POST create book
  @catchError()
  public async bookCreatePost(req: Request, res: Response, next: NextFunction) {
    req.body.genre = convertToArray(req.body.genre);
    const bookCreateDto: BookCreateDto = plainToClass(BookCreateDto, req.body);
    const validationErrors: ValidationError[] = await validate(bookCreateDto);

    const { title, author, summary, isbn, genre } = bookCreateDto;
    const book: Book = this.bookRepository.create({
      title,
      author: this.authorRepository.create({ id: +author }),
      summary,
      ISBN: isbn,
    });

    if (validationErrors.length) {
      // There are errors. Render form again with sanitized values/error messages.
      const { allAuthors, allGenres } = await this.getAllAuthorsAndGenres();

      res.render('book/book_form', {
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: convertToArrayError(validationErrors),
      });
      return;
    }

    // Data from form is valid. Save book.
    await this.bookRepository.save(book);
    await this.bookGenreRepository.save(
      Object.values(genre).map((genreId) => {
        return this.bookGenreRepository.create({
          genre: this.genreRepository.create({ id: +genreId }),
          book,
        });
      }),
    );
    res.redirect('/books');
    console.log('end post create new book');
  }

  // Function to get book details including genres and instances
  public async getBookDetails(id: number) {
    const book: Book = await this.bookRepository.findOne({
      where: { id: id },
      relations: ['author', 'bookInstances'],
    });

    const genre: BookGenre[] = await this.bookGenreRepository.find({
      where: { book: book },
      relations: ['genre'],
    });

    const bookInstances: BookInstance[] = book.bookInstances;

    return { book, genre, bookInstances };
  }

  // GET delete book
  @catchError()
  public async bookDeleteGet(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const { book, genre, bookInstances } = await this.getBookDetails(
      +req.params.id,
    );

    if (!book) {
      req.flash('error', req.t('home.no_book'));
      res.redirect('/books');
    }

    return res.render('book/book_delete', {
      book: book,
      genre: genre,
      book_instances: bookInstances,
    });
  }

  // POST delete book
  @catchError()
  public async bookDeletePost(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const { book, genre, bookInstances } = await this.getBookDetails(
      +req.params.id,
    );

    if (!book) {
      req.flash('error', req.t('home.no_book'));
      res.redirect('/books');
    }

    if (bookInstances.length) {
      // Sách có các phiên bản. Hiển thị form xóa tương tự như trang GET.
      return res.render('book/book_delete', {
        book: book,
        genre: genre,
        book_instances: bookInstances,
      });
    } else {
      for (const bookGenre of genre) {
        await this.bookGenreRepository.delete(bookGenre.id);
      }
      await this.bookRepository.delete(req.params.id);
      return res.redirect('/books');
    }
  }

  // Function to get book details including authors and genres
  private async getBookDetailsWithAuthorsAndGenres(id: number) {
    const [book, allAuthors, allGenres] = await Promise.all([
      this.bookRepository.findOne({
        where: { id: id },
        relations: ['author'],
      }),
      this.authorRepository.find({ order: { familyName: 'ASC' } }),
      this.genreRepository.find({ order: { name: 'ASC' } }),
    ]);

    return { book, allAuthors, allGenres };
  }

  // GET update book
  @catchError()
  public async bookUpdateGet(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const { book, allAuthors, allGenres } =
      await this.getBookDetailsWithAuthorsAndGenres(+req.params.id);

    res.render('book/book_form', {
      authors: allAuthors,
      genres: allGenres,
      book: book,
      update: true,
    });
  }

  // POST update book
  public async bookUpdatePost(req: Request, res: Response, next: NextFunction) {
    req.body.genre = convertToArray(req.body.genre);
    const bookCreateDto: BookCreateDto = plainToClass(BookCreateDto, req.body);
    const validationErrors: ValidationError[] = await validate(bookCreateDto);

    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const { book, allAuthors, allGenres } =
      await this.getBookDetailsWithAuthorsAndGenres(+req.params.id);

    if (!book) {
      req.flash('error', req.t('home.no_book'));
      res.redirect('/books');
    }

    book.title = req.body.title;
    book.author = req.body.author;
    book.summary = req.body.summary;
    book.ISBN = req.body.isbn;

    if (validationErrors.length) {
      res.render('book/book_form', {
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: validationErrors,
        update: true,
      });
      return;
    }

    await this.bookRepository.save(book);
    await this.bookGenreRepository.delete({ book: book });

    await this.bookGenreRepository.save(
      Object.values(bookCreateDto.genre).map((genreId) => {
        return this.bookGenreRepository.create({
          genre: this.genreRepository.create({ id: +genreId }),
          book,
        });
      }),
    );

    res.redirect(`/books/${book.id}`);
  }
}
