import { fetchJSON } from '../../utils/api';

type CommentDTO = {
  message: string;
  isIssue?: boolean;
};

export function postMarkersComment(id: string, comment: CommentDTO) {
  return fetchJSON(`/api/markers/${id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });
}

export function postRoutesComment(id: string, comment: CommentDTO) {
  return fetchJSON(`/api/marker-routes/${id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });
}
