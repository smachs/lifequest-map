import { useEffect, useState } from 'react';

export function getJSONItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
}

export function setJSONItem<T>(key: string, item: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.error(e);
  }
}

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((value: T) => T)) => void] {
  const [state, setState] = useState<T>(() =>
    getJSONItem<T>(key, initialValue)
  );

  function setValue(value: T | ((value: T) => T)) {
    try {
      const valueToStore =
        typeof value === 'function' ? (value as (value: T) => T)(state) : value;
      setJSONItem<T>(key, valueToStore);
      setState(valueToStore);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      try {
        if (event.key !== key) {
          return;
        }
        if (event.newValue) {
          const item = JSON.parse(event.newValue);
          setValue(item);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorage, false);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return [state, setValue];
}
