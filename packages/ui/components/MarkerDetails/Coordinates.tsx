import { ActionIcon, Group, Text } from '@mantine/core';
import { copyTextToClipboard } from '../../utils/clipboard';
import CopyIcon from '../icons/CopyIcon';

type CoordinatesProps = {
  position: [number, number, number];
};
function Coordinates({ position }: CoordinatesProps) {
  const coordinates = `[${position.join(', ')}]`;
  return (
    <Text size="xs">
      <Group spacing={2}>
        {coordinates}
        <ActionIcon
          onClick={() => {
            copyTextToClipboard(coordinates);
          }}
        >
          <CopyIcon />
        </ActionIcon>
      </Group>
    </Text>
  );
}

export default Coordinates;
