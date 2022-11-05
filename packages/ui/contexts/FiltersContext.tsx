import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { mapFilters } from 'static';
import { usePersistentState } from '../utils/storage';

type FiltersContextValue = {
  filters: string[];
  setFilters: (value: string[] | ((value: string[]) => string[])) => void;
};
const FiltersContext = createContext<FiltersContextValue>({
  filters: [],
  setFilters: () => undefined,
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
    if (filter.sizes) {
      return filter.sizes.map((size) => `${filter.type}-${size}`);
    }
    return filter.type;
  })
  .flat();
export function FiltersProvider({
  children,
}: FiltersProviderProps): JSX.Element {
  const [filters, setFilters] = usePersistentState<string[]>(
    'selected-filters',
    []
  );

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters(): FiltersContextValue {
  return useContext(FiltersContext);
}
