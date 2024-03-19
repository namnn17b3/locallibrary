import { IsArray, IsNotEmpty, IsString, MinLength } from 'class-validator';
import i18next from 'i18next';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import { IsIntArrayNotEmpty } from '../../decorators/custom.validator';

export class BookCreateDto {
  @IsNotEmpty({
    message: () => i18next.t('form.title_valid'),
  })
  @IsString()
  @MinLength(1)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  title: string;

  @IsNotEmpty({
    message: () => i18next.t('form.author_valid'),
  })
  @IsString()
  @MinLength(1)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  author: string;

  @IsNotEmpty({
    message: () => i18next.t('form.summary_valid'),
  })
  @IsString()
  @MinLength(1)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  summary: string;

  @IsNotEmpty({
    message: () => i18next.t('form.isbn_valid'),
  })
  @IsString()
  @MinLength(1)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  isbn: string;

  @Transform((params: TransformFnParams) =>
    params.value.map((item: string) => sanitizeHtml(item.trim())),
  )
  @IsArray()
  @IsIntArrayNotEmpty()
  @IsString({ each: true })
  genre: string[];
}
