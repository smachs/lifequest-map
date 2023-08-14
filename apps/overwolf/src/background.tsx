import { useSettingsStore } from 'ui/utils/settingsStore';
import { initPlausible } from 'ui/utils/stats';
import { getJSONItem } from 'ui/utils/storage';
import { getRunningNewWorld, NEW_WORLD_CLASS_ID } from './utils/games';
import { SHOW_HIDE_APP, SHOW_HIDE_INFLUENCE_OVERLAY } from './utils/hotkeys';
import {
  closeMainWindow,
  closeWindow,
  getPreferedWindowName,
  moveToOtherScreen,
  restoreWindow,
  toggleWindow,
  WINDOWS,
} from './utils/windows';

console.log('Starting background process');

let triggerGameLaunchEvents = window.location.href.includes('gamelaunchevent');
async function openApp() {
  const runningNewWorld = await getRunningNewWorld();
  const preferedWindowName = await getPreferedWindowName();
  console.log(runningNewWorld, preferedWindowName);
  if (runningNewWorld) {
    const windowId = await restoreWindow(preferedWindowName);
    if (preferedWindowName === WINDOWS.DESKTOP) {
      await moveToOtherScreen(windowId, runningNewWorld.monitorHandle.value);
    }

    if (getJSONItem('showMinimap', false)) {
      await restoreWindow(WINDOWS.MINIMAP);
    }

    console.log(useSettingsStore.getState().openMinimized);

    if (triggerGameLaunchEvents) {
      triggerGameLaunchEvents = false;

      if (useSettingsStore.getState().openMinimized) {
        console.log('Minimizing window');
        overwolf.windows.minimize(windowId);
      }
      if (useSettingsStore.getState().openAeternumMap) {
        console.log('Open aeternum-map.gg');
        overwolf.utils.openUrlInDefaultBrowser('https://aeternum-map.gg');
      }
    }
  } else {
    await restoreWindow(WINDOWS.DESKTOP);
  }
}
openApp();

async function handleHotkeyPressed(
  event: overwolf.settings.hotkeys.OnPressedEvent
) {
  if (event.name === SHOW_HIDE_APP) {
    const preferedWindowName = await getPreferedWindowName();
    toggleWindow(preferedWindowName);
  }
  if (event.name === SHOW_HIDE_INFLUENCE_OVERLAY) {
    toggleWindow(WINDOWS.INFLUENCE);
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
        const windowId = await restoreWindow(WINDOWS.DESKTOP);
        const runningNewWorld = await getRunningNewWorld();
        if (runningNewWorld) {
          moveToOtherScreen(windowId, runningNewWorld.monitorHandle.value);
        }
        closeWindow(WINDOWS.OVERLAY);
      }
      if (getJSONItem('showMinimap', false)) {
        restoreWindow(WINDOWS.MINIMAP);
      }
    } else if (preferedWindowName === WINDOWS.OVERLAY) {
      closeMainWindow();
    }
  }
});

initPlausible();
