import { Request, Response, NextFunction } from 'express';
import { Author } from '../entities/Author';
import { injectable, inject } from 'tsyringe';
import { AuthorRepository } from '../repositories/author.repository';
import { catchError } from '../decorators/catcherror.decorators';
import { convertDateTimeToJSDateString } from '../utils/utils';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';

@injectable()
export class AuthorController {
  constructor(
    @inject(AuthorRepository)
    private readonly authorRepository: AuthorRepository,
  ) {}

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
        dateOfBirth: convertDateTimeToJSDateString(
          new Date(author.dateOfBirth),
        ),
        dateOfDeath: convertDateTimeToJSDateString(
          new Date(author.dateOfDeath),
        ),
      })),
    });
  }

  // Detail author
  @catchError()
  public async authorDetail(req: Request, res: Response, next: NextFunction) {
    if (isNaN(+req.params.id))
      throw new AppException('Author is not exists', StatusEnum.NOT_FOUND);

    const author = await this.findAuthorWithBook(+req.params.id);
    if (!author)
      throw new AppException('Author is not exists', StatusEnum.NOT_FOUND);

    res.render('author/author_detail', {
      author: author,
    });
  }
}
