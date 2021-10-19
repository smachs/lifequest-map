import { useCallback, useEffect, useState } from 'react';
import { fetchJSON } from '../../utils/api';

export type Comment = {
  _id: string;
  markerId: string;
  createdAt: Date;
  username: string;
  message: string;
};

function useComments(markerId: string): {
  comments: Comment[] | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchJSON<Comment[]>(`/api/markers/${markerId}/comments`)
      .then((comments) =>
        comments.map((comment: Comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        }))
      )
      .then(setComments)
      .finally(() => setLoading(false));
  }, [markerId]);

  useEffect(() => {
    refresh();
  }, [refresh, markerId]);

  return { comments, loading, refresh };
}

export default useComments;
