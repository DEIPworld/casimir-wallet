export type Storage<T> = {
  load: (key: string) => T | undefined
  store: (key: string, value: T) => void
}

export function makeStorage<T>(): Storage<T> {
  const storage: { [key: string]: T } = {};

  return {
    load: (key: string): T | undefined => storage[key],
    store: (key: string, value: T): void => { storage[key] = value; }
  };
}

export function singleton<Result, Parameters extends any[]>(
  createInstance: (...args: Parameters) => Result
): (...args: Parameters) => Result {

  let storage: Storage<Result> | undefined;

  return (...args): Result => {

    if (!storage) {
      storage = makeStorage();
    }

    const key = JSON.stringify(args);

    let instance = storage.load(key);
    if (!instance) {
      instance = createInstance(...args);
      storage.store(key, instance);
    }

    return instance;
  };
}
