import { Button } from '@mantine/core';
import { notify } from '../../utils/notifications';
import { patchUser } from './api';
import { IconEyeOff, IconEye } from '@tabler/icons';
import { useState } from 'react';
import { useUserStore } from '../../utils/userStore';
import shallow from 'zustand/shallow';

type HideMarkerInputProps = {
  markerId: string;
};
function HideMarkerInput({ markerId }: HideMarkerInputProps): JSX.Element {
  const { user, refreshUser } = useUserStore(
    (state) => ({ user: state.user, refreshUser: state.refreshUser }),
    shallow
  );
  const [isLoading, setIsLoading] = useState(false);

  const discovered = user?.hiddenMarkerIds.includes(markerId);

  async function handleClick() {
    if (!user) {
      return;
    }
    setIsLoading(true);
    const hiddenMarkerIds = [...user.hiddenMarkerIds];
    if (!discovered && hiddenMarkerIds.indexOf(markerId) === -1) {
      hiddenMarkerIds.push(markerId);
    } else if (discovered && hiddenMarkerIds.indexOf(markerId) !== -1) {
      hiddenMarkerIds.splice(hiddenMarkerIds.indexOf(markerId), 1);
    } else {
      return;
    }
    await notify(patchUser(user.username, { hiddenMarkerIds }));
    await refreshUser();
    setIsLoading(false);
  }

  const isHidden = user?.hiddenMarkerIds.includes(markerId);
  return (
    <Button
      onClick={handleClick}
      color="cyan"
      disabled={!user}
      loading={isLoading}
      leftIcon={
        isHidden ? (
          <IconEyeOff size={20} stroke={1.5} />
        ) : (
          <IconEye size={20} stroke={1.5} />
        )
      }
      title={user ? "Node won't be shown on the map" : 'Character not detected'}
    >
      {isHidden ? 'Node is hidden on map' : 'Node is visible on map'}
    </Button>
  );
}

export default HideMarkerInput;
