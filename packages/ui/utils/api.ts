import { useUserStore } from './userStore';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

export async function fetchJSON<T>(
  url: RequestInfo,
  init: RequestInit | undefined = {}
): Promise<T> {
  const { account } = useUserStore.getState();
  if (account) {
    const sessionId = account?.sessionId || '';
    init.headers = {
      ...(init.headers || {}),
      'x-session-id': sessionId,
    };
  }
  const targetUrl = url.toString().startsWith('http')
    ? url
    : `${VITE_API_ENDPOINT}${url}`;
  const response = await fetch(targetUrl, init);

  if (!response.ok) {
    if (response.status === 401) {
      const event = new CustomEvent('session-expired');
      window.dispatchEvent(event);
    }
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      const body = await response.json();
      throw new Error(body);
    } else {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  }
  const body = await response.json();
  return body;
}

export function getScreenshotUrl(filename: string): string {
  return `${VITE_API_ENDPOINT}/screenshots/${filename}`;
}
