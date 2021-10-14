import { isNewWorldRunning, NEW_WORLD_CLASS_ID } from './utils/games';
import { SHOW_HIDE_APP } from './utils/hotkeys';
import { waitForOverwolf } from './utils/overwolf';
import {
  closeMainWindow,
  closeWindow,
  getPreferedWindowName,
  restoreWindow,
  toggleWindow,
  WINDOWS,
} from './utils/windows';

console.log('Starting background process');

async function openApp() {
  const newWorldIsRunning = await isNewWorldRunning();
  if (newWorldIsRunning) {
    const preferedWindowName = await getPreferedWindowName();
    restoreWindow(preferedWindowName);
  } else {
    restoreWindow(WINDOWS.DESKTOP);
  }
}
waitForOverwolf().then(openApp);

async function handleHotkeyPressed(
  event: overwolf.settings.hotkeys.OnPressedEvent
) {
  if (event.name === SHOW_HIDE_APP) {
    const preferedWindowName = await getPreferedWindowName();
    toggleWindow(preferedWindowName);
  }
}
overwolf.settings.hotkeys.onPressed.addListener(handleHotkeyPressed);

async function handleAppLaunch() {
  openApp();
}
overwolf.extensions.onAppLaunchTriggered.addListener(handleAppLaunch);

overwolf.games.onGameInfoUpdated.addListener(async (event) => {
  if (event.runningChanged && event.gameInfo?.classId === NEW_WORLD_CLASS_ID) {
    const preferedWindowName = await getPreferedWindowName();
    if (event.gameInfo.isRunning) {
      if (preferedWindowName === WINDOWS.OVERLAY) {
        restoreWindow(WINDOWS.OVERLAY);
        closeWindow(WINDOWS.DESKTOP);
      } else {
        restoreWindow(WINDOWS.DESKTOP);
        closeWindow(WINDOWS.OVERLAY);
      }
    } else {
      closeMainWindow();
    }
  }
});
