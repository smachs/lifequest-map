import { Button } from '@mantine/core';
import { IconServer2 } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { fetchJSON } from '../../utils/api';
import { trackOutboundLinkClick } from '../../utils/stats';

type ServerStatus = {
  success: boolean;
  data: {
    metrics: {
      'us-east-1': {
        queue: number;
        connected: number;
        lastUpdate: number;
      };
      'us-west-2': {
        queue: number;
        connected: number;
        lastUpdate: number;
      };
      'eu-central-1': {
        queue: number;
        connected: number;
        lastUpdate: number;
      };
      'sa-east-1': {
        queue: number;
        connected: number;
        lastUpdate: number;
      };
      'ap-southeast-2': {
        queue: number;
        connected: number;
        lastUpdate: number;
      };
    };
    servers: Array<Array<any>>;
    merges: Array<any>;
  };
};

const getServerStatus = () =>
  fetchJSON<ServerStatus>(`https://nwdb.info/server-status/servers_24h.json`);

const useServerStatus = () => useQuery(['server-status'], getServerStatus);

export default function ServerStatus() {
  //   const { data } = useServerStatus();

  return (
    <Button
      component="a"
      href="https://nwdb.info/server-status"
      target="_blank"
      onClick={() => trackOutboundLinkClick('https://nwdb.info/server-status')}
      leftIcon={<IconServer2 />}
      variant="default"
      size="xs"
      radius="xl"
    >
      Server Status
    </Button>
  );
}
