import { Button, Group } from '@mantine/core';
import { useRefreshUser, useUser } from '../../contexts/UserContext';
import { notify } from '../../utils/notifications';
import { patchUser } from './api';
import { IconEyeOff, IconEye } from '@tabler/icons';

type HideMarkerInputProps = {
  markerId: string;
};
function HideMarkerInput({ markerId }: HideMarkerInputProps): JSX.Element {
  const user = useUser();
  const refreshUser = useRefreshUser();

  const discovered = user?.hiddenMarkerIds.includes(markerId);

  async function handleClick() {
    if (!user) {
      return;
    }
    const hiddenMarkerIds = [...user.hiddenMarkerIds];
    if (!discovered && hiddenMarkerIds.indexOf(markerId) === -1) {
      hiddenMarkerIds.push(markerId);
    } else if (discovered && hiddenMarkerIds.indexOf(markerId) !== -1) {
      hiddenMarkerIds.splice(hiddenMarkerIds.indexOf(markerId), 1);
    } else {
      return;
    }
    await notify(patchUser(user.username, hiddenMarkerIds));
    refreshUser();
  }

  return (
    <Button
      onClick={handleClick}
      color="gray"
      variant="light"
      size="xs"
      compact
      mb="xs"
      sx={{
        '> *': {
          justifyContent: 'left',
        },
      }}
      disabled={!user}
      title={
        user ? "Marker won't be shown on the map" : 'Character not detected'
      }
    >
      <Group>
        {user?.hiddenMarkerIds.includes(markerId) ? (
          <>
            <IconEyeOff size={20} stroke={1.5} /> Marker is hidden
          </>
        ) : (
          <>
            <IconEye size={20} stroke={1.5} />
            Marker is visible
          </>
        )}
      </Group>
    </Button>
  );
}

export default HideMarkerInput;
