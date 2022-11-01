import { Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { Zone } from 'static';

const getLocaleDateString = (timeZone: string) =>
  new Date().toLocaleTimeString('en-US', {
    timeZone: timeZone,
    hour: '2-digit',
    minute: '2-digit',
  });
type Props = {
  zone: Zone;
};
const ServerTime = ({ zone }: Props) => {
  const [localeString, setLocaleString] = useState<string | null>(() =>
    getLocaleDateString(zone.timeZone)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLocaleString(getLocaleDateString(zone.timeZone));
    }, 1000 * 60);

    return () => {
      clearInterval(intervalId);
    };
  }, [zone]);

  return (
    <Text component="span" size="xs">
      {localeString}{' '}
      <Text component="span" size="xs" color="dimmed">
        {zone.timeZoneAbbreviation}
      </Text>
    </Text>
  );
};

export default ServerTime;
