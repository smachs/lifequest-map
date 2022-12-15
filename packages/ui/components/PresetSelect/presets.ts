import { allFilters } from '../../utils/filtersStore';

export type Preset = {
  name: string;
  types: string[];
};

export const staticPresets: Preset[] = [
  {
    name: 'All',
    types: allFilters,
  },
  {
    name: 'None',
    types: [],
  },
];
