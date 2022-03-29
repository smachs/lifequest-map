import { allFilters } from '../../contexts/FiltersContext';

export type Preset = {
  name: string;
  types: string[];
};

export const staticPresets: Preset[] = [
  {
    name: 'All markers',
    types: allFilters,
  },
  {
    name: 'No markers',
    types: [],
  },
];
