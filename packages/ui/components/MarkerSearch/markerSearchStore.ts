import { create } from 'zustand';
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

    const froms = searchValues.filter(
      (value) => value.startsWith('from: ') || value.startsWith('loot: ')
    );
    const newMarkerFilters = [...markerFilters].filter((markerFilter) =>
      froms.includes(markerFilter.context)
    );
    for (const from of froms) {
      const markerFilter = newMarkerFilters.find(
        ({ context }) => context === from
      );
      if (!markerFilter) {
        const [, option, name] = from.match(/(\w+): (.*)/)!;
        const markerIds = await fetchJSON<string[]>(
          `/api/search/${option}/${name}`
        );
        newMarkerFilters.push({ context: from, markerIds });
      }
    }

    set({ markerFilters: newMarkerFilters });
  },
}));
