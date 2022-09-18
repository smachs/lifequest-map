import { useEffect, useState } from 'react';
import type { LiveServer } from 'ui/components/LiveServer/liveServers';
import { liveServers, ping } from 'ui/components/LiveServer/liveServers';

function useServers() {
  const [servers, setServers] = useState<LiveServer[]>(liveServers);

  useEffect(() => {
    const pingAll = () => {
      Promise.all(
        liveServers.map(async (liveServer) => {
          const delay = await ping(liveServer);
          return {
            ...liveServer,
            delay,
          };
        })
      ).then(setServers);
    };

    pingAll();
    const intervalId = setInterval(pingAll, 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return servers;
}

export default useServers;
