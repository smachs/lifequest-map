import { useQuery } from '@tanstack/react-query';
import { fetchJSON } from '../../utils/api';
import type { MarkerRouteItem } from './MarkerRoutes';

const getMarkerRoute = (id?: string) =>
  fetchJSON<MarkerRouteItem>(`/api/marker-routes/${id}`);

const useMarkerRoute = (markerRouteId?: string) =>
  useQuery(['routes', markerRouteId], () => getMarkerRoute(markerRouteId), {
    enabled: !!markerRouteId,
  });

export default useMarkerRoute;
