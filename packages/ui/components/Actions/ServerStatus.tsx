import { Button, MediaQuery } from '@mantine/core';
import { IconServer2 } from '@tabler/icons-react';
import { trackOutboundLinkClick } from '../../utils/stats';

export default function ServerStatus() {
  return (
    <MediaQuery
      smallerThan="sm"
      styles={{
        display: 'none',
      }}
    >
      <Button
        component="a"
        href="https://nwdb.info/server-status"
        target="_blank"
        onClick={() =>
          trackOutboundLinkClick('https://nwdb.info/server-status')
        }
        leftIcon={<IconServer2 />}
        variant="default"
        size="xs"
        radius="xl"
      >
        Server Status
      </Button>
    </MediaQuery>
  );
}
