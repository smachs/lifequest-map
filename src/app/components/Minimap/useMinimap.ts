import { useEffect } from 'react';
import { usePersistentState } from '../../utils/storage';
import { closeWindow, restoreWindow, WINDOWS } from '../../utils/windows';

function useMinimap(): [
  boolean,
  (value: boolean | ((value: boolean) => boolean)) => void
] {
  const [showMinimap, setShowMinimap] = usePersistentState(
    'showMinimap',
    false
  );

  useEffect(() => {
    if (showMinimap) {
      restoreWindow(WINDOWS.MINIMAP);
    } else {
      closeWindow(WINDOWS.MINIMAP);
    }
  }, [showMinimap]);

  return [showMinimap, setShowMinimap];
}

export default useMinimap;
