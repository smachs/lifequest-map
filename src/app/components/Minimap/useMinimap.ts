import { useEffect } from 'react';
import { useIsNewWorldRunning } from '../../utils/games';
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
  const newWorldIsRunning = useIsNewWorldRunning();

  useEffect(() => {
    if (newWorldIsRunning && showMinimap) {
      restoreWindow(WINDOWS.MINIMAP, true);
    } else {
      closeWindow(WINDOWS.MINIMAP);
    }
  }, [newWorldIsRunning, showMinimap]);

  return [showMinimap, setShowMinimap];
}

export default useMinimap;
