import { isNewWorldRunning, NEW_WORLD_CLASS_ID } from 'ui/utils/games';
import { SHOW_HIDE_APP } from 'ui/utils/hotkeys';
import { writeLog } from 'ui/utils/logs';
import { waitForOverwolf } from 'ui/utils/overwolf';
import { initPlausible } from 'ui/utils/stats';
import { getJSONItem } from 'ui/utils/storage';
import {
  closeMainWindow,
  restoreWindow,
  toggleWindow,
  WINDOWS,
} from 'ui/utils/windows';

writeLog('Starting background process');

async function openApp() {
  const newWorldIsRunning = await isNewWorldRunning();
  if (newWorldIsRunning) {
    restoreWindow(WINDOWS.DESKTOP);
    if (getJSONItem('showMinimap', false)) {
      restoreWindow(WINDOWS.MINIMAP);
    }
  } else {
    restoreWindow(WINDOWS.DESKTOP);
  }
}
waitForOverwolf().then(openApp);

async function handleHotkeyPressed(
  event: overwolf.settings.hotkeys.OnPressedEvent
) {
  if (event.name === SHOW_HIDE_APP) {
    toggleWindow(WINDOWS.DESKTOP);
  }
}
overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);

async function handleAppLaunch() {
  openApp();
}
overwolf.extensions.onAppLaunchTriggered.addListener(handleAppLaunch);

overwolf.games.onGameInfoUpdated.addListener(async (event) => {
  if (event.runningChanged && event.gameInfo?.classId === NEW_WORLD_CLASS_ID) {
    if (event.gameInfo.isRunning) {
      restoreWindow(WINDOWS.DESKTOP);
      if (getJSONItem('showMinimap', false)) {
        restoreWindow(WINDOWS.MINIMAP);
      }
    } else {
      closeMainWindow();
    }
  }
});

initPlausible();
