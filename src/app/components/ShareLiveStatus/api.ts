import { fetchJSON } from '../../utils/api';

export function patchLiveShareToken(
  token: string,
  serverUrl: string
): Promise<{
  token: string;
}> {
  return fetchJSON<{ token: string }>('/api/auth/live-share-token', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, serverUrl }),
  });
}
