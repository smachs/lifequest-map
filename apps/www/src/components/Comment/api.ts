import { fetchJSON } from '../../utils/api';

export function deleteComment(id: string) {
  return fetchJSON(`/api/comments/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
