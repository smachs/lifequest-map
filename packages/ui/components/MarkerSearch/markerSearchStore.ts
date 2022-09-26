import create from 'zustand';
import { fetchJSON } from '../../utils/api';

type Store = {
  markerFilters: { context: string; markerIds: string[] }[];
  searchValues: string[];
  onChange: (values: string[]) => void;
  refreshMarkerIds: () => void;
};

export const useMarkerSearchStore = create<Store>((set, get) => ({
  markerFilters: [],
  searchValues: [],
  onChange: (searchValues) => set({ searchValues }),
  refreshMarkerIds: async () => {
    const { searchValues, markerFilters } = get();

    const froms = searchValues.filter((value) => value.startsWith('from: '));
    const newMarkerFilters = [...markerFilters].filter((markerFilter) =>
      froms.includes(markerFilter.context)
    );
    for (const from of froms) {
      const markerFilter = newMarkerFilters.find(
        ({ context }) => context === from
      );
      if (!markerFilter) {
        const markerIds = await fetchJSON<string[]>(
          `/api/search/from/${from.slice(6)}`
        );
        newMarkerFilters.push({ context: from, markerIds });
      }
    }

    set({ markerFilters: newMarkerFilters });
  },
}));
