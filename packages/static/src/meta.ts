import { findRegions } from './areas.js';
import type { FilterItem } from './mapFilters.js';
import { mapFilters } from './mapFilters.js';

export const formatList = (list: string[]) => {
  const lf = new Intl.ListFormat('en');
  return lf.format(list);
};

export const getNodeMeta = (node: {
  name?: string;
  type: string;
  position: [number, number, number];
  map?: string;
}) => {
  const filterItem =
    mapFilters.find((mapFilter) => mapFilter.type === node.type) ||
    mapFilters.find((mapFilter) => mapFilter.type === 'miscellaneous')!;
  const title = node.name || filterItem.title;
  const region = findRegions(
    [[node.position[1], node.position[0]]],
    node.map
  )[0];

  const description = `A ${filterItem.title} in ${region}.`;
  return { title, description };
};

export const getRouteMeta = (route: {
  name: string;
  regions: string[];
  markersByType: {
    [type: string]: number;
  };
}) => {
  const markerMapFilters: FilterItem[] = [];
  Object.keys(route.markersByType).forEach((markerType) => {
    const mapFilter = mapFilters.find(
      (mapFilter) => mapFilter.type === markerType
    );
    if (mapFilter) {
      markerMapFilters.push(mapFilter);
    }
  });

  const title = route.name;
  const description = `A farming route in ${formatList(
    route.regions
  )} with ${formatList(markerMapFilters.map((filter) => filter.title))}.`;

  return { title, description };
};
