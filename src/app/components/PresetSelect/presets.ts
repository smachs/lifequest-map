import { mapFilters } from '../MapFilter/mapFilters';

export type Preset = {
  name: string;
  types: string[];
};

export const staticPresets: Preset[] = [
  {
    name: 'All markers',
    types: mapFilters.map((filter) => filter.type),
  },
  {
    name: 'No markers',
    types: [],
  },
];
