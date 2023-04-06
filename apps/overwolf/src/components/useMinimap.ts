import { useEffect } from 'react';
import { usePersistentState } from 'ui/utils/storage';
import { SHOW_HIDE_MINIMAP } from '../utils/hotkeys';
import { closeWindow, restoreWindow, WINDOWS } from '../utils/windows';
import { useNewWorldGameInfo } from './store';

function useMinimap(): [
  boolean,
  (value: boolean | ((value: boolean) => boolean)) => void
] {
  const [showMinimap, setShowMinimap] = usePersistentState('showMinimap', true);

  const newWorldGameInfo = useNewWorldGameInfo();

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
    if (newWorldGameInfo?.isRunning && showMinimap) {
      restoreWindow(WINDOWS.MINIMAP);
    } else {
      closeWindow(WINDOWS.MINIMAP);
    }
  }, [newWorldGameInfo?.isRunning, showMinimap]);

  return [showMinimap, setShowMinimap];
}

export default useMinimap;
