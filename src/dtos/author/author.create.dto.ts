import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import {
  IsGreaterThanDateProperty,
  IsOptionalDate,
} from '../../decorators/custom.validator';
import i18next from 'i18next';

export class CreateAuthorDto {
  @IsNotEmpty({
    message: 'form.first_name_valid',
  })
  @IsAlphanumeric('en-US', {
    message: () => i18next.t('form.first_name_char'),
  })
  @MaxLength(255)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  first_name: string;

  @IsNotEmpty({
    message: () => i18next.t('form.family_name_valid'),
  })
  @IsAlphanumeric('en-US', {
    message: () => i18next.t('form.family_name_char'),
  })
  @MaxLength(255)
  @Transform((params: TransformFnParams) => sanitizeHtml(params.value.trim()))
  family_name: string;

  @IsOptionalDate({
    message: () => i18next.t('form.date_of_birth_valid'),
  })
  date_of_birth?: string;

  @IsOptionalDate({
    message: () => i18next.t('form.date_of_death_valid'),
  })
  @IsGreaterThanDateProperty('date_of_birth')
  date_of_death?: string;
}
