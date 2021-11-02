export interface IStorage<T> {
  read(): T | null;
  write(value: T): void;
}

export function KeyedLocalstorage(options: {
  localStorage: typeof localStorage;
  key: string;
}): IStorage<string> {
  return { read, write };
  function read() {
    const { key, localStorage } = options;
    return localStorage.getItem(key);
  }
  function write(value: string) {
    const { key, localStorage } = options;
    localStorage.setItem(key, value);
  }
}
