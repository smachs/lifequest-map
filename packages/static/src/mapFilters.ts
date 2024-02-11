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
    type: 'hotels',
    title: 'Hotels',
    iconUrl: '/pois/hotels.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'hostels',
    title: 'Hostels',
    iconUrl: '/pois/hostels.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'restaurants',
    title: 'Restaurants',
    iconUrl: '/pois/restaurants.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'beach',
    title: 'Beach',
    iconUrl: '/pois/beach.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'parks',
    title: 'Parks',
    iconUrl: '/pois/parks.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'nationalPark',
    title: 'National Park',
    iconUrl: '/pois/nationalpark.webp',
    hasName: true,
  },
  {
    category: 'places',
    type: 'mountains',
    title: 'Mountains',
    iconUrl: '/pois/mountains.webp',
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

  {
    category: 'work',
    type: 'meetup',
    title: 'Meetup',
    iconUrl: '/pois/meetup.webp',
    hasName: true,
  },
  {
    category: 'work',
    type: 'hackathon',
    title: 'Hackathon',
    iconUrl: '/pois/hackathon.webp',
    hasName: true,
  },
  {
    category: 'work',
    type: 'bootcamp',
    title: 'Bootcamp',
    iconUrl: '/pois/bootcamp.webp',
    hasName: true,
  },
  {
    category: 'work',
    type: 'coworking',
    title: 'Coworking',
    iconUrl: '/pois/coworking.webp',
    hasName: true,
  },

  {
    category: 'social',
    type: 'network',
    title: 'Network',
    iconUrl: '/pois/network.webp',
    hasName: true,
  },
  {
    category: 'social',
    type: 'party',
    title: 'Party',
    iconUrl: '/pois/party.webp',
    hasName: true,
  },
  {
    category: 'social',
    type: 'afterParty',
    title: 'After Party',
    iconUrl: '/pois/afterparty.webp',
    hasName: true,
  },

  {
    category: 'activities',
    type: 'gym',
    title: 'Gym',
    iconUrl: '/pois/gym.webp',
    hasName: true,
  },
  {
    category: 'activities',
    type: 'running',
    title: 'Running',
    iconUrl: '/pois/running.webp',
    hasName: true,
  },
  {
    category: 'activities',
    type: 'skateparks',
    title: 'Skateparks',
    iconUrl: '/pois/skateparks.webp',
    hasName: true,
  },
  {
    category: 'activities',
    type: 'swinning',
    title: 'Swinning',
    iconUrl: '/pois/swinning.webp',
    hasName: true,
  },
  {
    category: 'activities',
    type: 'surf',
    title: 'Surf',
    iconUrl: '/pois/surf.webp',
    hasName: true,
  },
  {
    category: 'activities',
    type: 'fishing',
    title: 'Fishing',
    iconUrl: '/pois/fishing.webp',
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
  {
    value: 'social',
    title: 'Social',
    filters: mapFilters.filter((mapFilter) => mapFilter.category === 'social'),
    borderColor: 'rgba(246, 177, 66, 0.7)',
  },
  {
    value: 'activities',
    title: 'Activities',
    filters: mapFilters.filter((mapFilter) => mapFilter.category === 'activities'),
    borderColor: 'rgba(246, 177, 66, 0.7)',
  },
  {
    value: 'work',
    title: 'Work',
    filters: mapFilters.filter((mapFilter) => mapFilter.category === 'work'),
    borderColor: 'rgba(246, 177, 66, 0.7)',
  },
];
