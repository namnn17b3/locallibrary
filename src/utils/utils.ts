import { DateTime } from 'luxon';

export function convertDateTimeToJSDateString(date: Date) {
  return date
    ? DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)
    : 'Undefined';
}
