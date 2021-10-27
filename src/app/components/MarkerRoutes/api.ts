import { fetchJSON } from '../../utils/api';
import type { MarkerRouteItem } from './MarkerRoutes';

export function deleteMarkerRoute(markerRouteId: string, userId: string) {
  return fetchJSON(`/api/marker-routes/${markerRouteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
    }),
  });
}

export function getMarkerRoutes(userId?: string) {
  return fetchJSON<MarkerRouteItem[]>(
    `/api/marker-routes?userId=${userId || ''}`
  );
}

type MarkerRouteDTO = {
  name: string;
  username: string;
  isPublic: boolean;
  positions: [number, number][];
  markersByType: {
    [type: string]: number;
  };
};
export function postMarkerRoute(markerRoute: MarkerRouteDTO) {
  return fetchJSON<MarkerRouteItem>('/api/marker-routes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(markerRoute),
  });
}
