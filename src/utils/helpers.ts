export const waitAsync = (timeout: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => resolve(), timeout);
    } catch (err) {
      reject(err);
    }
  });
};
