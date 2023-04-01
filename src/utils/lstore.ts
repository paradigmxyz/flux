import { useEffect, useState } from "react";

export function readLocalStorage<T>(key: string): T | null {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

export function writeLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStorage<T>(
  key: string
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] {
  const [value, setValue] = useState<T | null>(() => readLocalStorage(key));

  useEffect(() => setValue(readLocalStorage(key)), [key]);

  useEffect(() => writeLocalStorage(key, value), [key, value]);

  return [value, setValue];
}
