import { mapFilters } from '../MapFilter/mapFilters';

export type Preset = {
  name: string;
  types: string[];
};

export const staticPresets: Preset[] = [
  {
    name: 'All',
    types: mapFilters.map((filter) => filter.type),
  },
  {
    name: 'None',
    types: [],
  },
  {
    name: 'Harvesting',
    types: mapFilters
      .filter((filter) =>
        ['farming', 'cooking_ingredients'].includes(filter.category)
      )
      .map((filter) => filter.type),
  },
];
