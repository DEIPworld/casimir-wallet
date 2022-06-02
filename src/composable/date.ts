import {
  format,
  formatDistance as _formatDistance,
  formatDistanceToNow as _formatDistanceToNow,
  parseISO as _parseISO,
  isBefore as _isBefore,
  add
} from 'date-fns';

import { enGB } from 'date-fns/locale';

import type { Duration } from 'date-fns';

export function useDate() {
  const defaultOptions = {
    locale: enGB
  };

  function formatDate(
    date: Date | number,
    formatStr = 'PPP'
  ) {
    return format(date, formatStr, defaultOptions);
  }

  function formatDistance(date: Date, baseDate: Date, options: Record<string, unknown>) {
    return _formatDistance(date, baseDate, {
      ...options,
      ...defaultOptions
    });
  }

  function formatDistanceToNow(date: Date, options: Record<string, unknown>) {
    return _formatDistanceToNow(date, {
      ...options,
      ...defaultOptions
    });
  }

  function parseISO(
    dateString: string,
    convertToUtc = false,
    options: Record<string, unknown> = { additionalDigits: 2 }
) {
    // if (!dateString) {
    //   return _parseISO(dateString, options);
    // }
    //
    return convertToUtc
      ? _parseISO(`${dateString}Z`, options)
      : _parseISO(dateString, options);
  }

  function formatISO(date: string | Date) {
    let dateToParse;

    if (typeof date === 'string') {
      dateToParse = new Date(date);
    } else {
      dateToParse = date;
    }

    return `${dateToParse.toISOString().split('.')[0]}`;
  }

  function addTimePeriod(date: Date, duration: Duration): Date {
    return add(date, duration);
  }

  function isBefore(date: Date, dateToCompare: Date): boolean {
    return _isBefore(date, dateToCompare);
  }

  return {
    formatDate,
    formatDistance,
    formatDistanceToNow,
    parseISO,
    formatISO,
    addTimePeriod,
    isBefore
  };
}
