import { useQuery } from '@tanstack/react-query';
import { fetchJSON } from '../../utils/api';
import type { Comment } from '../Comment/api';
import type { MarkerRouteItem } from './MarkerRoutes';

const getMarkerRoute = (id?: string) =>
  fetchJSON<{ markerRoute: MarkerRouteItem; comments: Comment[] }>(
    `/api/marker-routes/${id}`
  ).then(({ markerRoute, comments }) => ({
    markerRoute,
    comments: comments.map((comment: Comment) => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
    })),
  }));

const useMarkerRoute = (markerRouteId?: string) =>
  useQuery(['routes', markerRouteId], () => getMarkerRoute(markerRouteId), {
    enabled: !!markerRouteId,
  });

export default useMarkerRoute;
