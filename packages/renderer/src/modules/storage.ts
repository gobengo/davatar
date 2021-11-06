type ReadResult<T> =
| { exists: false, value?: undefined }
| { exists: true, value: T }

export interface IStorage<T> {
  read(): ReadResult<T>;
  write(value: T): void;
}

export function KeyedLocalstorage(options: {
  localStorage: typeof localStorage;
  key: string;
}): IStorage<string> {
  return { read, write };
  function read(): ReadResult<string> {
    const { key, localStorage } = options;
    const storedItem = localStorage.getItem(key);
    if (storedItem === null) {
      return { exists: false as const, value: undefined };
    }
    return {
      exists: true as const,
      value: storedItem,
    };
  }
  function write(value: string) {
    const { key, localStorage } = options;
    localStorage.setItem(key, value);
  }
}

export function JsonStorage<T extends object>(stringStorage: IStorage<string>): IStorage<T> {
  return {
    read() {
      const stringReadResult = stringStorage.read();
      if ( ! stringReadResult.exists) { return { exists: false as const }; }
      const parsed = JSON.parse(stringReadResult.value);
      const result: ReadResult<T> = { exists: true, value: parsed };
      return result;
    },
    write(objectIn) {
      const str = JSON.stringify(objectIn, null, 2);
      stringStorage.write(str);
    },
  };
}
