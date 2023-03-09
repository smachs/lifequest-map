import { Button, Title } from '@mantine/core';
import { getGameInfo } from '../../utils/games';

const Debug = () => {
  return (
    <>
      <Title order={3} size="sm" align="center">
        Debug
      </Title>
      <Button
        onClick={() => {
          getGameInfo().then((result) =>
            overwolf.utils.placeOnClipboard(JSON.stringify(result, null, 2))
          );
        }}
      >
        Copy game info
      </Button>
    </>
  );
};

export default Debug;
