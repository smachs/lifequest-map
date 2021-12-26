import leaflet from 'leaflet';
import type { Position } from '../../contexts/PositionContext';
import locations from './locations.json';
import regions from './regions.json';

const COLOR = 'rgb(200 200 200)';

export function getRegions() {
  return regions.map((region) =>
    leaflet.polygon(region.coordinates as [number, number][], {
      color: COLOR,
      fill: false,
      weight: 1.2,
      interactive: false,
      pmIgnore: true,
    })
  );
}

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

export const findLocation = (position: Position): string | null => {
  return (
    locations.find((location) =>
      checkPointInsidePolygon(
        position.location,
        location.coordinates as [number, number][]
      )
    )?.name || null
  );
};

export const findRegion = (position: Position): string | null => {
  return (
    regions.find((region) =>
      checkPointInsidePolygon(
        position.location,
        region.coordinates as [number, number][]
      )
    )?.name || null
  );
};
