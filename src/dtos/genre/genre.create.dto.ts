import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import i18next from 'i18next';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

export class GenreCreateDto {
  @IsNotEmpty({
    message: () => i18next.t('form.genre_valid'),
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  name: string;
}
