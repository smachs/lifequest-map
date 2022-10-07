import locations from './locations.json' assert { type: 'json' };
import regions from './regions.json' assert { type: 'json' };
import { mapIsAeternumMap, findMapDetails, AETERNUM_MAP } from './maps.js';

export { regions, locations };
export type Area = {
  name: string;
  coordinates: number[][];
};

export const checkPointInsidePolygon = (
  point: [number, number],
  polygon: [number, number][]
) => {
  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

export const findLocation = (position: [number, number]): string | null => {
  return (
    locations.find((location) =>
      checkPointInsidePolygon(
        position,
        location.coordinates as [number, number][]
      )
    )?.name || null
  );
};

export const findRegion = (position: [number, number]): string | null => {
  return (
    regions.find((region) =>
      checkPointInsidePolygon(
        position,
        region.coordinates as [number, number][]
      )
    )?.name || null
  );
};

export const findRegions = (
  positions: [number, number][],
  map?: string
): string[] => {
  if (map && !mapIsAeternumMap(map)) {
    const mapDetail = findMapDetails(map);
    return [mapDetail?.title || 'Unknown'];
  }
  const regions = positions.map(
    (position) => findRegion(position) || AETERNUM_MAP.title
  );
  const uniqueRegions = regions.filter(
    (region, index) => regions.indexOf(region) === index
  );
  return uniqueRegions;
};

export const regionNames = regions.map((region) => region.name);
