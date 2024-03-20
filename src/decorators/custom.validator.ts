import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

function isDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function isFalsy(x: any) {
  return !x;
}

export function IsOptionalDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return isFalsy(value) || isDate(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `Invalid date of ${args.property}`;
        },
      },
    });
  };
}

export function IsGreaterThanDateProperty(
  otherPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const dateString = args.object[otherPropertyName];

          if (isFalsy(dateString) || isFalsy(value)) return true;
          if (!isDate(dateString) || !isDate(value)) return false;

          const date1 = new Date(value);
          const date2 = new Date(dateString);
          return date1 > date2;
        },
        defaultMessage(args: ValidationArguments) {
          return `Invalid date of ${args.property}`;
        },
      },
    });
  };
}
