import { Text } from '@mantine/core';
import type { World, Zone } from 'static';

type WorldNameProps = {
  world: World;
  zone: Zone;
};
const WorldName = ({ world, zone }: WorldNameProps) => {
  return (
    <Text size="xs">
      {world.publicName} ({zone.name})
    </Text>
  );
};

export default WorldName;
