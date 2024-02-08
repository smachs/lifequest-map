import type { MarkerSize } from './types.js';
import generatedDict from './dict.json' assert { type: 'json' };
export const defaultSizes: MarkerSize[] = ['?', 'S', 'M', 'L'];
export const treeSizes: MarkerSize[] = ['?', 'XS', 'S', 'M', 'L', 'XL'];
export type MarkerGlyph = { isRequired: boolean };
export type FilterItem = {
  type: string;
  category: string;
  title: string;
  iconUrl: string;
  hasName?: boolean;
  hasLevel?: boolean;
  hasHP?: boolean;
  hasCustomRespawnTimer?: boolean;
  maxTier?: number;
  glyph?: MarkerGlyph;
  sizes?: MarkerSize[];
};
const dict = generatedDict as Record<string, string>;
export const getTerm = (catIDs: string[]) => {
  return catIDs.map((catID) => dict[catID]).join(',');
};
export const lootableMapFilters = [
  'boss',
  'bossElite',
  'rafflebones_25',
  'rafflebones_66',
];
export const mapFilters: FilterItem[] = [
  {
    category: 'places',
    type: 'places',
    title: 'Beach',
    iconUrl: '/pois/beach.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'nationalPark',
    title: 'National Park',
    iconUrl: '/pois/national-park.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'camping',
    title: 'Camping',
    iconUrl: '/pois/camping.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'waterfalls',
    title: 'Waterfalls',
    iconUrl: '/pois/waterfalls.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'stargazing',
    title: 'Stargazing',
    iconUrl: '/pois/stargazing.webp',
    hasName: true,
  },  
];

export type MapFiltersCategory = {
  value: string;
  title: string;
  filters: FilterItem[];
  borderColor?: string;
};

export const mapFiltersCategories: MapFiltersCategory[] = [
  {
    value: 'places',
    title: 'Places',
    filters: mapFilters.filter((mapFilter) => mapFilter.category === 'places'),
    borderColor: 'rgba(246, 177, 66, 0.7)',
  },
];
