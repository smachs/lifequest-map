import { useCallback, useEffect, useState } from 'react';
import type { Mutate, StoreApi } from 'zustand';
import { isEmbed } from './routes';
import useDebounce from './useDebounce';

export function getJSONItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
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
  listener = true
): [T, (value: T | ((value: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const value =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    return getJSONItem<T>(key, value);
  });
  useDebounce(state, (value) => setJSONItem<T>(key, value));

  const setValue = useCallback(
    (value: T | ((value: T) => T)) => {
      try {
        const valueToStore =
          typeof value === 'function'
            ? (value as (value: T) => T)(state)
            : value;
        setState(valueToStore);
      } catch (e) {
        console.error(e);
      }
    },
    [state]
  );

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
          const value = JSON.parse(event.newValue);
          setValue(value);
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorage, false);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [listener]);

  return [state, setValue];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreWithPersist<State = any> = Mutate<
  StoreApi<State>,
  [['zustand/persist', State]]
>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
  const storageEventCallback = (e: StorageEvent) => {
    try {
      if (e.key && e.key === store.persist.getOptions().name && e.newValue) {
        store.persist.rehydrate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  window.addEventListener('storage', storageEventCallback);

  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};
