import {
  Anchor,
  Badge,
  Button,
  Group,
  Slider,
  Stack,
  Text,
} from '@mantine/core';
import { shallow } from 'zustand/shallow';
import { useSettingsStore } from '../../utils/settingsStore';
import { trackOutboundLinkClick } from '../../utils/stats';
import OtherPlayersServerSelect from '../OtherPlayersServerSelect/OtherPlayersServerSelect';

export default function OtherPlayers() {
  const {
    showOtherPlayers,
    toggleShowOtherPlayers,
    otherPlayersSize,
    setOtherPlayersSize,
    showOtherRespawnTimers,
    toggleShowOtherRespawnTimers,
    otherPlayersWorldName,
  } = useSettingsStore(
    (state) => ({
      showOtherPlayers: state.showOtherPlayers,
      toggleShowOtherPlayers: state.toggleShowOtherPlayers,
      otherPlayersSize: state.otherPlayersSize,
      setOtherPlayersSize: state.setOtherPlayersSize,
      showOtherRespawnTimers: state.showOtherRespawnTimers,
      toggleShowOtherRespawnTimers: state.toggleShowOtherRespawnTimers,
      otherPlayersWorldName: state.otherPlayersWorldName,
    }),
    shallow
  );

  return (
    <>
      <Text size="sm" weight={500}>
        Other users
      </Text>
      <Text>
        See the player movement and respawn timers of other players to get an
        understanding of crowded areas. Only{' '}
        <Anchor
          href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
          target="_blank"
          onClick={() =>
            trackOutboundLinkClick(
              'https://www.overwolf.com/app/Leon_Machens-Aeternum_Map'
            )
          }
          inline
        >
          Aeternum Map
        </Anchor>{' '}
        users (anonymous) are visible.
      </Text>
      <Stack spacing="xs">
        <Text weight={500} size="sm">
          Marker Size
          <Slider
            value={otherPlayersSize}
            min={1}
            max={30}
            onChange={(value) => setOtherPlayersSize(value)}
          />
        </Text>
        <OtherPlayersServerSelect />
        <Button compact onClick={toggleShowOtherPlayers} fullWidth>
          {showOtherPlayers ? 'Hide other players' : 'Show other players'}
        </Button>
        <Button
          compact
          onClick={toggleShowOtherRespawnTimers}
          fullWidth
          disabled={!otherPlayersWorldName}
        >
          {showOtherRespawnTimers
            ? 'Hide other respawn timers'
            : 'Show other respawn timers'}
        </Button>
        <Group grow>
          <Text size="xs" color="dimmed">
            Few
          </Text>
          <Badge radius="xs" sx={{ background: '#84ca50' }} variant="filled" />
          <Badge radius="xs" sx={{ background: '#f07d02' }} variant="filled" />
          <Badge radius="xs" sx={{ background: '#e60000' }} variant="filled" />
          <Badge radius="xs" sx={{ background: '#9e1313' }} variant="filled" />
          <Text size="xs" color="dimmed">
            Many
          </Text>
        </Group>
      </Stack>
    </>
  );
}
