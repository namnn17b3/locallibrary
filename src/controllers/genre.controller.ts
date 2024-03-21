import { Request, Response, NextFunction } from 'express';
import { Genre } from '../entities/Genre';
import { inject, injectable } from 'tsyringe';
import { GenreRepository } from '../repositories/genre.repository';
import { BookGenreRepository } from '../repositories/bookgenre.repository';
import { catchError } from '../decorators/catcherror.decorators';
import { GenreCreateDto } from '../dtos/genre/genre.create.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { convertToArrayError } from '../utils/utils';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';

@injectable()
export class GenreController {
  constructor(
    @inject(GenreRepository)
    private readonly genreRepository: GenreRepository,

    @inject(BookGenreRepository)
    private readonly bookGenreRepository: BookGenreRepository,
  ) {}

  public async getGenreDetails(genreId: number) {
    return await this.genreRepository.findOne({
      where: { id: genreId },
    });
  }

  public async getBookGenres(genre: Genre) {
    return await this.bookGenreRepository.find({
      where: { genre: genre },
      relations: ['book'],
    });
  }

  // Display list of all Genre.
  @catchError()
  public async genreList(req: Request, res: Response, next: NextFunction) {
    const allGenres = await this.genreRepository.find();
    res.render('genre/genre_list', {
      genre_list: allGenres,
    });
  }

  // Detail genre
  @catchError()
  public async genreDetail(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const genre = await this.getGenreDetails(+req.params.id);
    const bookGenres = await this.getBookGenres(genre);

    if (!genre) {
      req.flash('error', req.t('home.no_genre'));
      return res.redirect('/genres');
    }

    res.render('genre/genre_detail', {
      genre: genre,
      books: bookGenres,
    });
  }

  // GET create form
  @catchError()
  public async getGenreCreateForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    res.render('genre/genre_form');
  }

  // POST create form
  @catchError()
  public async postGenreCreateForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const genreCreateDto = plainToClass(GenreCreateDto, req.body);
    const validationErrors = await validate(genreCreateDto);

    if (validationErrors.length) {
      res.render('genre/genre_form', {
        errors: convertToArrayError(validationErrors),
      });
      return;
    }

    const genre = this.genreRepository.create({
      name: genreCreateDto.name,
    });

    const genreExists = await this.genreRepository.findOne({
      where: { name: genre.name },
    });

    if (!genreExists) {
      await this.genreRepository.save(genre);
    }
    res.redirect('/genres');
  }

  // GET delete genre
  @catchError()
  public async genreDeleteGet(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const genre = await this.getGenreDetails(+req.params.id);
    const bookGenres = await this.getBookGenres(genre);

    if (!genre) {
      req.flash('error', req.t('home.no_genre'));
      return res.redirect('/genres');
    }

    res.render('genre/genre_delete', {
      genre: genre,
      genre_books: bookGenres,
    });
  }

  // POST delete genre
  @catchError()
  public async genreDeletePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const genre = await this.getGenreDetails(+req.params.id);
    const bookGenres = await this.getBookGenres(genre);

    if (bookGenres.length) {
      res.render('genre_delete', {
        genre: genre,
        genre_books: bookGenres,
      });
      return;
    }
    await this.genreRepository.delete(req.params.id);
    res.redirect('/genres');
  }

  // GET update genre
  @catchError()
  public async genreUpdateGet(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const genre = await this.getGenreDetails(+req.params.id);

    if (!genre) {
      req.flash('error', req.t('home.no_genre'));
      return res.redirect('/genres');
    }

    res.render('genre/genre_form', {
      genre: genre,
      update: true,
    });
  }

  // POST update genre
  @catchError()
  public async genreUpdatePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const genre = await this.getGenreDetails(+req.params.id);
    if (!genre) {
      req.flash('error', req.t('home.no_genre'));
      return res.redirect('/genres');
    }

    const genreCreateDto = plainToClass(GenreCreateDto, req.body);
    const validationErrors = await validate(genreCreateDto);
    genre.name = genreCreateDto.name;

    if (validationErrors.length) {
      res.render('genre/genre_form', {
        genre: genre,
        errors: convertToArrayError(validationErrors),
        update: true,
      });
      return;
    }

    await this.genreRepository.save(genre);
    res.redirect('/genres');
  }
}
