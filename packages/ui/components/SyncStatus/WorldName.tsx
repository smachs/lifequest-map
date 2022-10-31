import { Text } from '@mantine/core';
import { getWorld, getZone } from 'static';
type WorldNameProps = {
  worldName: string;
};
const WorldName = ({ worldName }: WorldNameProps) => {
  const world = getWorld(worldName);
  const zone = world && getZone(world.zone);

  return (
    <Text size="xs">
      {!world || !zone ? worldName : `${world.publicName} (${zone.name})`}
    </Text>
  );
};

export default WorldName;
