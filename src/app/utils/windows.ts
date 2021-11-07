import { writeLog } from './logs';
import { getJSONItem, setJSONItem } from './storage';

export const WINDOWS = {
  DESKTOP: 'desktop',
  OVERLAY: 'overlay',
  BACKGROUND: 'background',
  MINIMAP: 'minimap',
};

export function getCurrentWindow(): Promise<overwolf.windows.WindowInfo> {
  return new Promise((resolve, reject) => {
    overwolf.windows.getCurrentWindow((result) => {
      if (result.success) {
        resolve(result.window);
      } else {
        reject(result.error);
      }
    });
  });
}

export function obtainDeclaredWindow(
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

export async function minimizeCurrentWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  overwolf.windows.minimize(currentWindow.id);
}

export async function maximizeCurrentWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  overwolf.windows.maximize(currentWindow.id);
}

export async function restoreCurrentWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  overwolf.windows.restore(currentWindow.id);
}

export async function closeWindow(windowName: string): Promise<void> {
  const backgroundWindow = await obtainDeclaredWindow(windowName);
  overwolf.windows.close(backgroundWindow.id);
}

export async function closeCurrentWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  return closeWindow(currentWindow.id);
}

export async function closeMainWindow(): Promise<void> {
  return closeWindow(WINDOWS.BACKGROUND);
}

export async function getPreferedWindowName(): Promise<string> {
  const preferedWindowName = getJSONItem<string | undefined>(
    'preferedWindowName',
    undefined
  );
  if (preferedWindowName) {
    return preferedWindowName;
  }
  const secondScreen = await getMonitor(false);
  return secondScreen ? WINDOWS.DESKTOP : WINDOWS.OVERLAY;
}

export async function restoreWindow(
  windowName: string,
  preventCenter?: boolean
): Promise<string> {
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
        writeLog(`Window ${windowName} restored`);
        if (!preventCenter) {
          const alreadyCentered = getJSONItem<boolean>(
            `centered-${windowName}`,
            false
          );
          if (!alreadyCentered) {
            const primaryDisplay = declaredWindow.name === WINDOWS.OVERLAY;
            await centerWindow(windowName, primaryDisplay);
            setJSONItem(`centered-${declaredWindow.name}`, true);
            writeLog(`Window ${windowName} centered`);
          }
        }
        resolve(result.window_id!); // window_id is always a string if success
      } else {
        reject(result.error);
      }
    });
  });
}

export function toggleWindow(windowName: string): void {
  overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
    if (['normal', 'maximized'].includes(result.window.stateEx)) {
      overwolf.windows.hide(result.window.id);
    } else {
      restoreWindow(result.window.name);
    }
  });
}

export async function togglePreferedWindow(): Promise<void> {
  const preferedWindowName = getJSONItem<string>(
    'preferedWindowName',
    WINDOWS.DESKTOP
  );
  setJSONItem(
    'preferedWindowName',
    preferedWindowName === WINDOWS.DESKTOP ? WINDOWS.OVERLAY : WINDOWS.DESKTOP
  );
  await restoreWindow(
    preferedWindowName === WINDOWS.DESKTOP ? WINDOWS.OVERLAY : WINDOWS.DESKTOP
  );
  await closeWindow(preferedWindowName);
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

export async function centerWindow(
  windowName: string,
  primaryDisplay = true
): Promise<void> {
  const monitor = await getMonitor(primaryDisplay);
  if (!monitor) {
    return;
  }
  const declaredWindow = await obtainDeclaredWindow(windowName);

  return new Promise((resolve) => {
    overwolf.windows.changePosition(
      declaredWindow.name,
      monitor.x + Math.round((monitor.width - declaredWindow.width) / 2),
      monitor.y + Math.round((monitor.height - declaredWindow.height) / 2),
      () => resolve()
    );
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
        auto_dpi_resize: true,
      });
    }
  }
}
