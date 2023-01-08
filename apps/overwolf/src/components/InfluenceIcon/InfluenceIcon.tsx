import {
  ActionIcon,
  Anchor,
  HoverCard,
  Image,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconScreenshot } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchJSON } from 'ui/utils/api';
import { toggleWindow, WINDOWS } from 'ui/utils/windows';
import { usePosition } from '../../contexts/PositionContext';
import useWindowIsVisible from '../useWindowIsVisible';

const InfluenceIcon = () => {
  const isVisible = useWindowIsVisible(WINDOWS.INFLUENCE);
  const { worldName } = usePosition();
  const { data: todaysCount } = useQuery(
    ['influence', worldName],
    () => fetchJSON<number>(`/api/influences/today?worldName=${worldName}`),
    { enabled: !!worldName && worldName !== 'Unknown' }
  );
  const [sawTooltip, setSawTooltip] = useState(false);
  return (
    <HoverCard width={380} shadow="md" withinPortal openDelay={200}>
      <HoverCard.Dropdown
        sx={{
          left: '8px !important',
        }}
      >
        <Text>Influence screenshot overlay</Text>
        <Text color="dimmed">
          You can contribute by scanning the factions influence map on your
          server with this tool.
          <Image src="/influence-preview.webp" fit="contain" height={317} />
          The overlay is visible in-game and usable with a simple click. Please
          move the influence map to fit the overlay.
          <br />
          The data is used to display the influence per server on{' '}
          <Anchor href="https://aeternum-map.gg" target="_blank">
            aeternum-map.gg
          </Anchor>
          .
        </Text>
      </HoverCard.Dropdown>
      <HoverCard.Target>
        <Tooltip
          opened={todaysCount === 0 && !sawTooltip}
          label="👋 Can you help us?"
          withArrow
          color="cyan"
        >
          <ActionIcon
            onClick={() => toggleWindow(WINDOWS.INFLUENCE, true)}
            color={isVisible ? 'cyan' : 'dark'}
            variant={isVisible ? 'filled' : 'transparent'}
            onMouseOver={() => todaysCount === 0 && setSawTooltip(true)}
          >
            <IconScreenshot />
          </ActionIcon>
        </Tooltip>
      </HoverCard.Target>
    </HoverCard>
  );
};

export default InfluenceIcon;
