import { Select } from '@mantine/core';
import { getZone, worlds } from 'static';
import shallow from 'zustand/shallow';
import { useSettingsStore } from '../../utils/settingsStore';

const OtherPlayersServerSelect = () => {
  const { otherPlayersWorldName, setOtherPlayersWorldName } = useSettingsStore(
    (state) => ({
      otherPlayersWorldName: state.otherPlayersWorldName,
      setOtherPlayersWorldName: state.setOtherPlayersWorldName,
    }),
    shallow
  );

  return (
    <Select
      label="Select a server"
      description="Only users from this server will be visible. If you don't select a server, all users are visible."
      placeholder="Pick one"
      value={otherPlayersWorldName}
      onChange={setOtherPlayersWorldName}
      clearable
      searchable
      data={worlds.map((world) => ({
        value: world.worldName,
        label: world.publicName,
        group: getZone(world.zone)?.name,
      }))}
    />
  );
};

export default OtherPlayersServerSelect;
