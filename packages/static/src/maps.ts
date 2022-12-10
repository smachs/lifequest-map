import type { LatLngExpression } from 'leaflet';
import maps from './maps.json' assert { type: 'json' };

export type Map = {
  name: string;
  title: string;
  folder: string;
  maxZoom: number;
  minZoom: number;
  maxBounds: LatLngExpression[];
};

export const mapDetails = maps as Map[];

export const AETERNUM_MAP = mapDetails[0];

export const findMapDetails = (map: string) => {
  const lowerCasedMap = map.toLowerCase();
  return mapDetails.find(
    (mapDetail) =>
      mapDetail.name.toLowerCase() === lowerCasedMap ||
      mapDetail.title.toLowerCase() === lowerCasedMap
  );
};

export const mapIsAeternumMap = (map: string) => {
  const mapDetails = findMapDetails(map);
  return mapDetails ? mapDetails.name === AETERNUM_MAP.name : false;
};
