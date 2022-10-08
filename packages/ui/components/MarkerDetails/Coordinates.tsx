import { Group, Text } from '@mantine/core';
import { copyTextToClipboard } from '../../utils/clipboard';
import CopyIcon from '../icons/CopyIcon';

type CoordinatesProps = {
  position: [number, number, number];
};
function Coordinates({ position }: CoordinatesProps) {
  const coordinates = `[${position.join(', ')}]`;
  return (
    <Text size="xs">
      <Group spacing={0}>
        {coordinates}
        <button
          onClick={() => {
            copyTextToClipboard(coordinates);
          }}
        >
          <CopyIcon />
        </button>
      </Group>
    </Text>
  );
}

export default Coordinates;
