import { useQuery } from '@tanstack/react-query';
import { fetchJSON } from '../../utils/api';
import type { Comment } from '../Comment/api';
import type { MarkerFull } from 'static';

const getMarker = (id?: string) =>
  fetchJSON<{ marker: MarkerFull; comments: Comment[] }>(
    `/api/markers/${id}`
  ).then(({ marker, comments }) => ({
    marker,
    comments: comments.map((comment: Comment) => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
    })),
  }));

const useMarker = (markerId?: string) =>
  useQuery(['markers', markerId], () => getMarker(markerId), {
    enabled: !!markerId,
  });

export default useMarker;
