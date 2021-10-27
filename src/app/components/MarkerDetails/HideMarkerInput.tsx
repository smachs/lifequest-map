import type { ChangeEvent } from 'react';
import { useRefreshUser, useUser } from '../../contexts/UserContext';
import { notify } from '../../utils/notifications';
import { patchUser } from './api';

type HideMarkerInputProps = {
  markerId: string;
};
function HideMarkerInput({ markerId }: HideMarkerInputProps): JSX.Element {
  const user = useUser();
  const refreshUser = useRefreshUser();

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!user) {
      return;
    }
    const { checked } = event.target;
    const hiddenMarkerIds = [...user.hiddenMarkerIds];
    if (checked && hiddenMarkerIds.indexOf(markerId) === -1) {
      hiddenMarkerIds.push(markerId);
    } else if (!checked && hiddenMarkerIds.indexOf(markerId) !== -1) {
      hiddenMarkerIds.splice(hiddenMarkerIds.indexOf(markerId), 1);
    } else {
      return;
    }
    await notify(patchUser(user.username, hiddenMarkerIds));
    refreshUser();
  }
  return (
    <label
      data-tooltip={
        user ? "Marker won't be shown on the map" : 'Login to hide marker'
      }
    >
      <input
        type="checkbox"
        onChange={handleChange}
        disabled={!user}
        checked={user?.hiddenMarkerIds.includes(markerId)}
      />{' '}
      Hide this marker
    </label>
  );
}

export default HideMarkerInput;
