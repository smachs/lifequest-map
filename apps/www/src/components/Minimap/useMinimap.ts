import { useEffect } from 'react';
import { useIsNewWorldRunning } from '../../utils/games';
import { SHOW_HIDE_MINIMAP } from '../../utils/hotkeys';
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
    async function handleHotkeyPressed(
      event: overwolf.settings.hotkeys.OnPressedEvent
    ) {
      if (event.name === SHOW_HIDE_MINIMAP) {
        setShowMinimap(!showMinimap);
      }
    }
    overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);

    return () => {
      overwolf.settings.hotkeys.onPressed.removeListener(handleHotkeyPressed);
    };
  }, [showMinimap]);

  useEffect(() => {
    if (newWorldIsRunning && showMinimap) {
      restoreWindow(WINDOWS.MINIMAP);
    } else {
      closeWindow(WINDOWS.MINIMAP);
    }
  }, [newWorldIsRunning, showMinimap]);

  return [showMinimap, setShowMinimap];
}

export default useMinimap;
