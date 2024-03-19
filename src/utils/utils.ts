import { ValidationError } from 'class-validator';
import { DateTime } from 'luxon';

export function convertDateTimeToJSDateString(date: any) {
  return date
    ? DateTime.fromJSDate(new Date(date)).toLocaleString(DateTime.DATE_MED)
    : 'Unknown';
}

export function convertToArrayError(validationErrors: ValidationError[]) {
  return validationErrors.map(({ constraints }) => {
    let message = '';
    Object.values(constraints).forEach((value) => (message += `${value} `));
    return Error(message);
  });
}

export function convertToArray(arg: any) {
  if (!Array.isArray(arg)) {
    return arg ? [arg] : [];
  }
  return arg;
}
