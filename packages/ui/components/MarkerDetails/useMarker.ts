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
  map?: string;
  level?: number;
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  userId?: string;
  username?: string;
  comments?: number;
  chestType?: string;
  tier?: number;
  customRespawnTimer?: number;
  _id: string;
};

function useMarker(markerId?: string) {
  const [result, setResult] = useState<{
    marker: MarkerFull;
    comments: Comment[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!markerId) {
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return await notify(
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
        .catch(() => setResult(null))
        .finally(() => setLoading(false))
    );
  }, [markerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...result,
    loading,
    refresh,
  };
}

export default useMarker;
