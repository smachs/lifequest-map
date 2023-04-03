import { useSettingsStore } from 'ui/utils/settingsStore';
import { isNewWorldRunning } from './games';

export const WINDOWS = {
  DESKTOP: 'desktop',
  OVERLAY: 'overlay',
  BACKGROUND: 'background',
  MINIMAP: 'minimap',
  INFLUENCE: 'influence',
};

export async function getCurrentWindow(): Promise<overwolf.windows.WindowInfo> {
  return await new Promise<overwolf.windows.WindowInfo>((resolve) =>
    overwolf.windows.getCurrentWindow((result) => resolve(result.window))
  );
}

export async function getWindowState(
  windowName: string
): Promise<overwolf.windows.GetWindowStateResult> {
  return await new Promise<overwolf.windows.GetWindowStateResult>((resolve) =>
    overwolf.windows.getWindowState(windowName, (result) => resolve(result))
  );
}

export async function obtainDeclaredWindow(
  windowName: string
): Promise<overwolf.windows.WindowInfo> {
  return new Promise((resolve, reject) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        resolve(result.window);
      } else {
        reject(result.error);
      }
    });
  });
}

export async function dragMoveWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  overwolf.windows.dragMove(currentWindow.id);
}

export async function closeWindow(windowName: string): Promise<void> {
  const window = await obtainDeclaredWindow(windowName);
  overwolf.windows.close(window.id);
}

export async function closeCurrentWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  overwolf.windows.close(currentWindow.id);
}

export async function closeMainWindow(): Promise<void> {
  return closeWindow(WINDOWS.BACKGROUND);
}

export async function restoreWindow(windowName: string): Promise<string> {
  const declaredWindow = await obtainDeclaredWindow(windowName);

  return new Promise((resolve, reject) => {
    if (declaredWindow.isVisible) {
      overwolf.windows.bringToFront(windowName, () => undefined);
      resolve(declaredWindow.id);
      return;
    }
    overwolf.windows.restore(windowName, async (result) => {
      if (result.success) {
        await new Promise((resolve) =>
          overwolf.windows.bringToFront(windowName, resolve)
        );
        console.log(`Window ${windowName} restored`);

        resolve(result.window_id!); // window_id is always a string if success
      } else {
        reject(result.error);
      }
    });
  });
}

export async function toggleWindow(
  windowName: string,
  close = false
): Promise<void> {
  const window = await obtainDeclaredWindow(windowName);
  if (['normal', 'maximized'].includes(window.stateEx)) {
    if (close) {
      overwolf.windows.close(window.id);
    } else {
      overwolf.windows.hide(window.id);
    }
  } else {
    restoreWindow(window.name);
  }
}

export async function getMonitor(
  primaryDisplay: boolean
): Promise<overwolf.utils.Display | undefined> {
  const monitors = await getDisplays();

  const monitor = monitors.find(
    (display) => display.is_primary === primaryDisplay
  );
  return monitor;
}

export function getDisplays(): Promise<overwolf.utils.Display[]> {
  return new Promise<overwolf.utils.Display[]>((resolve) => {
    overwolf.utils.getMonitorsList((result) => {
      resolve(result.displays);
    });
  });
}

export async function dragResize(
  edge: overwolf.windows.enums.WindowDragEdge,
  square?: boolean
): Promise<void> {
  const currentWindow = await getCurrentWindow();
  const result = await new Promise<overwolf.windows.DragResizeResult>(
    (resolve) => {
      overwolf.windows.dragResize(
        currentWindow.id,
        edge,
        // @ts-ignore
        null,
        resolve
      );
    }
  );
  if (square) {
    if (result.height && result.width) {
      const minSize = Math.max(
        Math.floor((result.width + result.height) / 2),
        200
      );
      overwolf.windows.changeSize({
        window_id: result.id!,
        width: minSize,
        height: minSize,
      });
    }
  }
}

export async function getPreferedWindowName(): Promise<string> {
  const state = useSettingsStore.getState();
  if (state.overlayMode === null) {
    const monitors = await getMonitorsList();
    const hasSecondScreen = monitors.length > 1;
    useSettingsStore.setState({
      overlayMode: !hasSecondScreen,
    });
    return hasSecondScreen ? WINDOWS.DESKTOP : WINDOWS.OVERLAY;
  }

  const preferedWindowName = state.overlayMode
    ? WINDOWS.OVERLAY
    : WINDOWS.DESKTOP;
  return preferedWindowName;
}

export function getMonitorsList(): Promise<overwolf.utils.Display[]> {
  return new Promise<overwolf.utils.Display[]>((resolve) => {
    overwolf.utils.getMonitorsList((result) => {
      resolve(result.displays);
    });
  });
}

export async function moveToSecondScreen(windowId: string) {
  const monitors = await getMonitorsList();
  const hasSecondScreen = monitors.length > 1;
  if (!hasSecondScreen) {
    return;
  }
  const desktopWindow = await obtainDeclaredWindow(WINDOWS.DESKTOP);
  const secondScreens = monitors.filter(
    (monitor) => monitor.is_primary === false
  );
  const secondScreen =
    secondScreens.find(
      (secondScreen) => desktopWindow.monitorId === secondScreen.id
    ) || secondScreens[0];
  if (desktopWindow.monitorId === secondScreen.id) {
    return;
  }

  const x = secondScreen.x + Math.floor(secondScreen.width / 2 - 1200 / 2);
  const y = secondScreen.y + Math.floor(secondScreen.height / 2 - 800 / 2);
  return new Promise((resolve) =>
    overwolf.windows.changePosition(windowId, x, y, resolve)
  );
}

export async function togglePreferedWindow(): Promise<void> {
  const preferedWindowName = await getPreferedWindowName();
  const newPreferedWindowName =
    preferedWindowName === WINDOWS.DESKTOP ? WINDOWS.OVERLAY : WINDOWS.DESKTOP;
  useSettingsStore.setState({
    overlayMode: preferedWindowName === WINDOWS.DESKTOP,
  });

  if (newPreferedWindowName === WINDOWS.OVERLAY) {
    const isGameRunning = await isNewWorldRunning();
    if (isGameRunning) {
      await restoreWindow(WINDOWS.OVERLAY);
      await closeWindow(WINDOWS.DESKTOP);
    }
  } else {
    await restoreWindow(WINDOWS.DESKTOP);
    await closeWindow(WINDOWS.OVERLAY);
  }
}
