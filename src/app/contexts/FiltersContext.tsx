import type { ReactNode } from 'react';
import { useState } from 'react';
import { createContext, useContext } from 'react';
import { mapFilters } from '../components/MapFilter/mapFilters';
import { DEFAULT_MAP_NAME } from '../components/WorldMap/maps';
import { usePersistentState } from '../utils/storage';

type FiltersContextValue = {
  filters: string[];
  setFilters: (value: string[] | ((value: string[]) => string[])) => void;
  map: string;
  setMap: (map: string) => void;
};
const FiltersContext = createContext<FiltersContextValue>({
  filters: [],
  setFilters: () => undefined,
  map: DEFAULT_MAP_NAME,
  setMap: () => undefined,
});

type FiltersProviderProps = {
  children: ReactNode;
};

export const allFilters = mapFilters
  .map((filter) => {
    if (filter.category === 'chests') {
      const tierTypes = Array(filter.maxTier || 5)
        .fill(null)
        .map((_, index) => `${filter.type}-${index + 1}`);
      return tierTypes;
    }
    return filter.type;
  })
  .flat();
export function FiltersProvider({
  children,
}: FiltersProviderProps): JSX.Element {
  const [filters, setFilters] = usePersistentState<string[]>(
    'filters',
    allFilters
  );
  const [map, setMap] = useState(DEFAULT_MAP_NAME);

  return (
    <FiltersContext.Provider value={{ filters, setFilters, map, setMap }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters(): FiltersContextValue {
  return useContext(FiltersContext);
}
