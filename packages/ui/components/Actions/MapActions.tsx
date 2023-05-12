import { ActionIcon, Button, HoverCard, Stack } from '@mantine/core';
import {
  IconCompass,
  IconCurrentLocation,
  IconMinus,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';
import { shallow } from 'zustand/shallow';
import { usePlayerStore } from '../../utils/playerStore';
import { isEmbed } from '../../utils/routes';
import { useSettingsStore } from '../../utils/settingsStore';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
const CurrentLocation = lazy(() => import('./CurrentLocation'));
const Minimap = lazy(() => import('./Minimap'));
const OtherPlayers = lazy(() => import('./OtherPlayers'));

const MapActions = () => {
  const player = usePlayerStore((state) => state.player);
  const { showOtherPlayers, toggleShowOtherPlayers, showOtherRespawnTimers } =
    useSettingsStore(
      (state) => ({
        showOtherPlayers: state.showOtherPlayers,
        toggleShowOtherPlayers: state.toggleShowOtherPlayers,
        showOtherRespawnTimers: state.showOtherRespawnTimers,
      }),
      shallow
    );

  const zoomControls = (
    <Button.Group orientation="vertical">
      <Button
        compact
        variant="default"
        p={0}
        onClick={() => latestLeafletMap!.zoomIn()}
        aria-label="Zoom in"
      >
        <IconPlus />
      </Button>
      <Button
        compact
        variant="default"
        p={0}
        onClick={() => latestLeafletMap!.zoomOut()}
        aria-label="Zoom out"
      >
        <IconMinus />
      </Button>
    </Button.Group>
  );
  if (isEmbed) {
    return zoomControls;
  }

  return (
    <Stack spacing="xs">
      <HoverCard width={320} shadow="md" position="left">
        <HoverCard.Target>
          <ActionIcon
            variant="default"
            size="md"
            radius="sm"
            onClick={() => {
              if (player?.position?.location) {
                latestLeafletMap!.panTo(
                  [player.position.location[0], player.position.location[1]],
                  {
                    animate: true,
                    easeLinearity: 1,
                    duration: 1,
                    noMoveStart: true,
                  }
                );
              }
            }}
            aria-label="Current location"
          >
            <IconCurrentLocation size={20} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Suspense>
            <CurrentLocation />
          </Suspense>
        </HoverCard.Dropdown>
      </HoverCard>
      <HoverCard width={320} shadow="md" position="left">
        <HoverCard.Target>
          <ActionIcon
            variant="default"
            size="md"
            radius="sm"
            aria-label="Minimap"
          >
            <IconCompass size={20} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Suspense>
            <Minimap />
          </Suspense>
        </HoverCard.Dropdown>
      </HoverCard>
      <HoverCard width={320} shadow="md" position="left">
        <HoverCard.Target>
          <ActionIcon
            color="blue"
            variant={
              showOtherPlayers || showOtherRespawnTimers ? 'filled' : 'default'
            }
            size="md"
            radius="sm"
            onClick={toggleShowOtherPlayers}
            aria-label="Other players"
          >
            <IconUsers size={20} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Suspense>
            <OtherPlayers />
          </Suspense>
        </HoverCard.Dropdown>
      </HoverCard>
      {zoomControls}
    </Stack>
  );
};

export default MapActions;
