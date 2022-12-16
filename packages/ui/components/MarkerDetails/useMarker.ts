import { useQuery } from '@tanstack/react-query';
import { fetchJSON } from '../../utils/api';
import type { Comment } from '../Comment/api';

export type MarkerFull = {
  type: string;
  position: [number, number, number];
  name?: string;
  map?: string;
  level?: number;
  hp?: number;
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  userId?: string;
  username?: string;
  comments?: number;
  chestType?: string;
  tier?: number;
  requiredGlyphId?: number;
  customRespawnTimer?: number;
  _id: string;
};

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
