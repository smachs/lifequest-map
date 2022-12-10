import { Button } from '@mantine/core';
import { copyTextToClipboard } from 'ui/utils/clipboard';
import { getGameInfo } from '../../utils/games';

const Debug = () => {
  return (
    <>
      <h4>Debug</h4>
      <Button
        onClick={() => {
          getGameInfo().then((result) =>
            copyTextToClipboard(JSON.stringify(result, null, 2))
          );
        }}
      >
        Copy game info
      </Button>
    </>
  );
};

export default Debug;
