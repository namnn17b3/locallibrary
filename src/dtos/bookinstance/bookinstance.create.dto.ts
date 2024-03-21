import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsISO8601,
  MaxLength,
  IsEnum,
} from 'class-validator';
import i18next from 'i18next';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import { BookInstanceStatus } from '../../enum/bookinstance.status.enum';

export class BookInstanceCreateDto {
  @IsNotEmpty({
    message: () => i18next.t('form.book_valid'),
  })
  @IsString()
  @MaxLength(255)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  book: string;

  @IsNotEmpty({ message: () => i18next.t('form.imprint_valid') })
  @IsString()
  @MaxLength(255)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  imprint: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  @IsEnum(BookInstanceStatus)
  status?: string;

  @IsOptional()
  @IsISO8601(
    { strict: true },
    { message: () => i18next.t('form.dueBack_valid') },
  )
  due_back?: string;
}
