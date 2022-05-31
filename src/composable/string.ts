export function useString() {
  const defaultAddressLength = 14;

  function formatAddress(address= '', length = defaultAddressLength, separator = '...'): string {
    if (address.length <= length) return address;

    const charsToShow: number = length - separator.length;
    const frontChars: number = Math.ceil(charsToShow/2);
    const backChars: number = Math.floor(charsToShow/2);

    return address.slice(0, frontChars) + separator + address.slice(address.length - backChars);
  }

  return {
    formatAddress
  };
}
