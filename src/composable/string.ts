export function useString() {
  const defaultStringLength = 14;

  function middleTruncate(
    fullString = '',
    length = defaultStringLength,
    separator = '...'
  ): string {
    if (fullString.length <= length) return fullString;

    const charsToShow: number = length - separator.length;
    const frontChars: number = Math.ceil(charsToShow/2);
    const backChars: number = Math.floor(charsToShow/2);

    const prefix: string = fullString.slice(0, frontChars);
    const suffix: string = fullString.slice(fullString.length - backChars);

    return `${prefix}${separator}${suffix}`;
  }

  return {
    middleTruncate
  };
}
