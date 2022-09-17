import { writeError } from '../../utils/logs';
import { servers } from 'realtime';

export type LiveServer = {
  name: string;
  url: string;
  delay?: number;
};

export const liveServers: LiveServer[] = [...servers];

const { VITE_API_ENDPOINT } = import.meta.env;

if (
  typeof VITE_API_ENDPOINT === 'string' &&
  VITE_API_ENDPOINT.includes('localhost')
) {
  liveServers.push({
    name: 'dev',
    url: VITE_API_ENDPOINT.replace('http', 'ws'),
  });
}

export const ping = async (liveServer: LiveServer) => {
  const now = Date.now();
  try {
    const url = liveServer.url.replace('ws', 'http');
    await fetch(`${url}/api/live/ping`);
    return Date.now() - now;
  } catch (error) {
    writeError(error);
    return undefined;
  }
};
