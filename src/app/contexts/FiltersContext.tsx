import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { usePersistentState } from '../utils/storage';

type FiltersContextValue = [
  string[],
  (value: string[] | ((value: string[]) => string[])) => void
];
const FiltersContext = createContext<FiltersContextValue>([
  [],
  () => undefined,
]);

type FiltersProviderProps = {
  children: ReactNode;
};

export function FiltersProvider({
  children,
}: FiltersProviderProps): JSX.Element {
  const [filters, setFilters] = usePersistentState<string[]>('filters', []);

  return (
    <FiltersContext.Provider value={[filters, setFilters]}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters(): FiltersContextValue {
  return useContext(FiltersContext);
}
