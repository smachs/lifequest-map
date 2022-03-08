import { useCallback, useEffect, useState } from 'react';
import { fetchJSON } from '../../utils/api';
import { notify } from '../../utils/notifications';

export type Comment = {
  _id: string;
  markerId: string;
  createdAt: Date;
  userId: string;
  username: string;
  message: string;
  isIssue?: boolean;
};

export type MarkerFull = {
  type: string;
  position: [number, number, number];
  name?: string;
  level?: number;
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  userId?: string;
  username?: string;
  comments?: number;
  _id: string;
};

function useMarker(markerId: string): {
  marker?: MarkerFull;
  comments?: Comment[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [result, setResult] = useState<
    { marker: MarkerFull; comments: Comment[] } | Record<string, never>
  >({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return notify(
      fetchJSON<{ marker: MarkerFull; comments: Comment[] }>(
        `/api/markers/${markerId}`
      )
        .then(({ marker, comments }) =>
          setResult({
            marker,
            comments: comments.map((comment: Comment) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            })),
          })
        )
        .finally(() => setLoading(false))
    );
  }, [markerId]);

  useEffect(() => {
    refresh();
  }, [refresh, markerId]);

  return { ...result, loading, refresh };
}

export default useMarker;
