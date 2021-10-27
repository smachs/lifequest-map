import { fetchJSON } from '../../utils/api';

type CommentDTO = {
  username: string;
  message: string;
};

export function postComment(markerId: string, comment: CommentDTO) {
  return fetchJSON(`/api/markers/${markerId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });
}
