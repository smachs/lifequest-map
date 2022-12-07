import { useEffect, useState } from 'react';
import { writeError } from './logs';
import useDebounce from './useDebounce';
// @ts-ignore
import lzwCompress from 'lzwcompress';
import { isEmbed } from './routes';

export function getJSONItem<T>(
  key: string,
  defaultValue: T,
  compression = false
): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return compression ? lzwCompress.unpack(item) : JSON.parse(item);
  } catch (e) {
    writeError(e);
    return defaultValue;
  }
}

export function setJSONItem<T>(
  key: string,
  item: T,
  compression = false
): void {
  try {
    if (compression) {
      if (Array.isArray(item) && item.length > 0) {
        localStorage.setItem(key, lzwCompress.pack(item));
      }
    } else {
      localStorage.setItem(key, JSON.stringify(item));
    }
  } catch (e) {
    writeError(e);
  }
}

export function serializeMapView(
  map: string,
  view: {
    y: number;
    x: number;
    zoom: number;
  }
) {
  if (isEmbed) {
    return;
  }
  setJSONItem(`mapView-${map}`, view);
}

const defaultMapView = {
  x: null,
  y: null,
  zoom: null,
};
export function deserializeMapView(map: string) {
  if (isEmbed) {
    return defaultMapView;
  }
  return (
    getJSONItem<{
      y: number;
      x: number;
      zoom: number;
    } | null>(`mapView-${map}`, null) ?? defaultMapView
  );
}

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T),
  listener = true,
  compression = false
): [T, (value: T | ((value: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const value =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    return getJSONItem<T>(key, value, compression);
  });
  useDebounce(state, (value) => setJSONItem<T>(key, value, compression));

  function setValue(value: T | ((value: T) => T)) {
    try {
      const valueToStore =
        typeof value === 'function' ? (value as (value: T) => T)(state) : value;
      setState(valueToStore);
    } catch (e) {
      writeError(e);
    }
  }

  useEffect(() => {
    if (!listener) {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      try {
        if (event.key !== key) {
          return;
        }
        if (event.newValue) {
          const value = compression
            ? lzwCompress.unpack(event.newValue)
            : JSON.parse(event.newValue);
          setValue(value);
        }
      } catch (e) {
        writeError(e);
      }
    };
    window.addEventListener('storage', handleStorage, false);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [listener]);

  return [state, setValue];
}
