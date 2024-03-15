import { Request, Response, NextFunction } from 'express';
import { Author } from '../entities/Author';
import { injectable, inject } from 'tsyringe';
import { AuthorRepository } from '../repositories/author.repository';
import { catchError } from '../decorators/catcherror.decorators';
import { convertDateTimeToJSDateString } from '../utils/utils';

@injectable()
export class AuthorController {
  constructor(
    @inject(AuthorRepository)
    private readonly authorRepository: AuthorRepository,
  ) {}

  // Display list of all Authors.
  @catchError()
  public async authorList(req: Request, res: Response, next: NextFunction) {
    const allAuthors: Author[] = await this.authorRepository.find({
      order: { familyName: 'ASC' },
    });

    res.render('author/author_list', {
      author_list: allAuthors.map((author) => ({
        ...author,
        dateOfBirth: convertDateTimeToJSDateString(
          new Date(author.dateOfBirth),
        ),
        dateOfDeath: convertDateTimeToJSDateString(
          new Date(author.dateOfDeath),
        ),
      })),
    });
  }
}
