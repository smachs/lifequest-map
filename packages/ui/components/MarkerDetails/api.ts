import { fetchJSON } from '../../utils/api';

export function patchUser(
  username: string,
  payload: { hiddenMarkerIds?: string[]; worldName?: string }
) {
  return fetchJSON(`/api/users/${username}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteMarker(markerId: string) {
  return fetchJSON(`/api/markers/${markerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
