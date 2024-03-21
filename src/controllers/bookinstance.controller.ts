import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { BookInstanceRepository } from '../repositories/bookinstance.repository';
import { BookRepository } from '../repositories/book.repository';
import { catchError } from '../decorators/catcherror.decorators';
import { plainToClass } from 'class-transformer';
import { BookInstanceCreateDto } from '../dtos/bookinstance/bookinstance.create.dto';
import { validate } from 'class-validator';
import {
  convertDateTimeToJSDateString,
  convertToArrayError,
} from '../utils/utils';
import { BookInstance } from '../entities/BookInstance';
import { AppException } from '../exceptions/app.exception';
import { StatusEnum } from '../enum/status.enum';

@injectable()
export class BookInstanceController {
  constructor(
    @inject(BookInstanceRepository)
    private readonly bookInstanceRepository: BookInstanceRepository,

    @inject(BookRepository)
    private readonly bookRepository: BookRepository,
  ) {}

  private async getBookInstanceDetails(instanceId: number) {
    return await this.bookInstanceRepository.findOne({
      where: { id: instanceId },
      relations: ['book'],
    });
  }

  // Display list of all BookInstances.
  @catchError()
  public async bookinstanceList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const allBookInstances: BookInstance[] =
      await this.bookInstanceRepository.find({
        relations: ['book'],
      });

    res.render('bookinstance/bookinstance_list', {
      bookinstance_list: allBookInstances.map((bookInstance) => ({
        ...bookInstance,
        dueBack: convertDateTimeToJSDateString(bookInstance.dueBack),
      })),
    });
  }

  // detail bookinstance
  @catchError()
  public async bookinstanceDetail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const bookInstance = await this.getBookInstanceDetails(+req.params.id);

    if (!bookInstance) {
      req.flash('error', req.t('home.no_bookinstance'));
      res.redirect('/bookinstances');
    }

    res.render('bookinstance/bookinstance_detail', {
      bookinstance: bookInstance,
    });
  }

  // Function to get all books
  private async getAllBooks() {
    return await this.bookRepository.find({
      order: { title: 'ASC' },
    });
  }

  // GET create form bookinstance
  @catchError()
  public async bookinstanceCreateGet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const bookList = await this.getAllBooks();
    res.render('bookinstance/bookinstance_form', {
      book_list: bookList,
    });
  }

  // POST create bookinstance
  @catchError()
  public async bookinstanceCreatePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const bookInstanceCreateDto = plainToClass(BookInstanceCreateDto, req.body);
    const validationErrors = await validate(bookInstanceCreateDto);

    if (validationErrors.length) {
      const bookList = await this.getAllBooks();
      res.render('bookinstance/bookinstance_form', {
        book_list: bookList,
        errors: convertToArrayError(validationErrors),
        bookinstance: bookInstanceCreateDto,
      });
      return;
    }

    const bookInstance = this.bookInstanceRepository.create({
      book: this.bookRepository.create({ id: +bookInstanceCreateDto.book }),
      imprint: bookInstanceCreateDto.imprint,
      status: bookInstanceCreateDto.status,
      dueBack: bookInstanceCreateDto.due_back,
    });

    await this.bookInstanceRepository.save(bookInstance);

    res.redirect('/bookinstances');
  }

  // GET delete bookinstance
  @catchError()
  public async bookinstanceDeleteGet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const bookInstance = await this.getBookInstanceDetails(+req.params.id);

    if (!bookInstance) {
      req.flash('error', req.t('home.no_bookinstance'));
      res.redirect('/bookinstances');
    }

    return res.render('bookinstance/bookinstance_delete', {
      bookinstance: bookInstance,
    });
  }

  // POST delete bookinstance
  @catchError()
  public async bookinstanceDeletePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    await this.bookInstanceRepository.delete(req.body.id);
    res.redirect('/bookinstances');
  }

  // GET update bookinstance
  @catchError()
  public async bookinstanceUpdateGet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    // Get bookInstance and all books for form (in parallel)
    const bookInstance = await this.getBookInstanceDetails(+req.params.id);

    const allBooks = await this.bookRepository.find({
      order: { title: 'ASC' },
    });

    if (!bookInstance) {
      req.flash('error', req.t('home.no_bookinstance'));
      res.redirect('/bookinstances');
    }

    res.render('bookinstance/bookinstance_form', {
      book_list: allBooks,
      selected_book: bookInstance.book.id,
      bookinstance: bookInstance,
      update: true,
    });
  }

  // POST update bookinstance
  @catchError()
  public async bookinstanceUpdatePost(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (isNaN(+req.params.id))
      throw new AppException('error.id_format_int', StatusEnum.BAD_REQUEST);

    const bookInstance = await this.bookInstanceRepository.findOne({
      where: { id: +req.params.id },
    });
    if (!bookInstance) {
      req.flash('error', req.t('home.no_bookinstance'));
      res.redirect('/bookinstances');
    }

    bookInstance.book = req.body.book;
    bookInstance.imprint = req.body.imprint;
    bookInstance.status = req.body.status;
    bookInstance.dueBack = req.body.due_back;

    const bookInstanceCreateDto = plainToClass(BookInstanceCreateDto, req.body);

    const validationErrors = await validate(bookInstanceCreateDto);
    if (validationErrors.length) {
      // There are errors.
      // Render the form again, passing sanitized values and errors.
      const allBooks = await this.bookRepository.find({
        order: { title: 'ASC' },
      });

      res.render('bookinstance_form', {
        book_list: allBooks,
        selected_book: bookInstance.book.id,
        errors: convertToArrayError(validationErrors),
        bookinstance: bookInstance,
        update: true,
      });
      return;
    }

    // Data from form is valid.
    await this.bookInstanceRepository.save(bookInstance);

    // Redirect to detail page.
    res.redirect('/bookinstances');
  }
}
