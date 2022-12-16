import { fetchJSON } from '../../utils/api';

export function deleteComment(id: string) {
  return fetchJSON(`/api/comments/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export type Comment = {
  _id: string;
  markerId: string;
  createdAt: Date;
  userId: string;
  username: string;
  message: string;
  isIssue?: boolean;
};
