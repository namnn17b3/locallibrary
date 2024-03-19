import { Request, Response, NextFunction } from 'express';
import { Author } from '../entities/Author';
import { injectable, inject } from 'tsyringe';
import { AuthorRepository } from '../repositories/author.repository';
import { plainToClass } from 'class-transformer';
import { CreateAuthorDto } from '../dtos/author/author.create.dto';
import { validate } from 'class-validator';
import {
  convertDateTimeToJSDateString,
  convertToArrayError,
} from '../utils/utils';
import { catchError } from '../decorators/catcherror.decorators';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';

@injectable()
export class AuthorController {
  constructor(
    @inject(AuthorRepository)
    private readonly authorRepository: AuthorRepository,
  ) {}

  private async findAuthorById(authorId: number) {
    return await this.authorRepository.findOne({
      where: { id: authorId },
    });
  }

  private async findAuthorWithBook(authorId: number) {
    return await this.authorRepository.findOne({
      where: { id: authorId },
      relations: ['books'],
    });
  }

  // Display list of all Authors.
  @catchError()
  public async authorList(req: Request, res: Response, next: NextFunction) {
    const allAuthors: Author[] = await this.authorRepository.find({
      order: { familyName: 'ASC' },
    });

    res.render('author/author_list', {
      author_list: allAuthors.map((author) => ({
        ...author,
        dateOfBirth: convertDateTimeToJSDateString(author.dateOfBirth),
        dateOfDeath: convertDateTimeToJSDateString(author.dateOfDeath),
      })),
    });
  }

  // Detail author
  @catchError()
  public async authorDetail(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const author = await this.findAuthorWithBook(+req.params.id);
    if (!author)
      throw new AppException('error.author_not_exists', StatusEnum.NOT_FOUND);

    if (!author)
      throw new AppException('error.author_not_exists', StatusEnum.NOT_FOUND);

    res.render('author/author_detail', {
      author: author,
    });
  }

  // GET create author
  public async getAuthorCreateForm(
    req: Request,
    res: Response,
    nex: NextFunction,
  ) {
    res.render('author/author_form');
  }

  // POST create author
  public async postAuthorCreateForm(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const authorDto = plainToClass(CreateAuthorDto, req.body);
    const validationErrors = await validate(authorDto);

    if (validationErrors.length) {
      res.render('author/author_form', {
        errors: convertToArrayError(validationErrors),
        author: {
          firstName: authorDto.first_name,
          familyName: authorDto.family_name,
          dateOfBirth: authorDto.date_of_birth,
          dateOfDeath: authorDto.date_of_death,
        },
      });
      return;
    }

    const author = this.authorRepository.create({
      firstName: authorDto.first_name,
      familyName: authorDto.family_name,
      dateOfBirth: new Date(authorDto.date_of_birth),
      name: `${authorDto.first_name} ${authorDto.family_name}`,
    });

    await this.authorRepository.save(author);

    res.redirect('/authors');
  }

  // GET delete author
  @catchError()
  public async authorDeleteGet(req: Request, res: Response) {
    if (isNaN(+req.params.id))
      throw new AppException('error.author_not_exists', StatusEnum.BAD_REQUEST);

    const author = await this.findAuthorWithBook(+req.params.id);
    if (!author)
      throw new AppException('error.author_not_exists', StatusEnum.NOT_FOUND);

    const allBooksByAuthor = author?.books;
    res.render('author/author_delete', {
      author: author,
      authorBooks: allBooksByAuthor,
    });
  }

  // POST delete author
  @catchError()
  public async authorDeletePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const author = await this.findAuthorWithBook(+req.params.id);
    if (!author)
      throw new AppException('error.author_not_exists', StatusEnum.NOT_FOUND);

    const allBooksByAuthor = author.books;
    if (allBooksByAuthor.length > 0) {
      res.render('author/author_delete', {
        author: author,
        authorBooks: allBooksByAuthor,
      });
      return;
    }
    await this.authorRepository.delete(req.params.id);
    res.redirect('/authors');
  }

  // GET author update
  @catchError()
  public async authorUpdateGet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!+req.params.id) {
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);
    }
    const author: Author = await this.findAuthorById(+req.params.id);
    if (!author) {
      throw new AppException('error.author_not_exists', StatusEnum.NOT_FOUND);
    }
    res.render('author/author_form', {
      author: author,
      update: true,
    });
  }

  // POST author update
  @catchError()
  public async authorUpdatePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!+req.params.id) {
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);
    }

    const authorDto = plainToClass(CreateAuthorDto, req.body);

    const validationErrors = await validate(authorDto);
    if (validationErrors.length) {
      res.render('author/author_form', {
        errors: convertToArrayError(validationErrors),
        update: true,
        author: {
          id: +req.params.id,
          firstName: authorDto.first_name,
          familyName: authorDto.family_name,
          dateOfBirth: authorDto.date_of_birth,
          dateOfDeath: authorDto.date_of_death,
        },
      });
      return;
    }

    const author = await this.findAuthorById(+req.params.id);
    if (!author)
      throw new AppException('error.author_not_exists', StatusEnum.NOT_FOUND);

    author.firstName = authorDto.first_name;
    author.familyName = authorDto.family_name;
    author.dateOfBirth = authorDto.date_of_birth
      ? new Date(authorDto.date_of_birth)
      : null;
    author.dateOfDeath = authorDto.date_of_death
      ? new Date(authorDto.date_of_death)
      : null;
    author.name = `${req.body.first_name} ${req.body.family_name}`;

    await this.authorRepository.save(author);
    res.redirect('/authors');
  }
}
