import { writeLog } from './logs';
import { getJSONItem, setJSONItem } from './storage';

export const WINDOWS = {
  DESKTOP: 'desktop',
  OVERLAY: 'overlay',
  BACKGROUND: 'background',
  MINIMAP: 'minimap',
};

const currentWindow = new Promise<overwolf.windows.WindowInfo>((resolve) =>
  overwolf.windows.getCurrentWindow((result) => resolve(result.window))
);

export function getCurrentWindow(): Promise<overwolf.windows.WindowInfo> {
  return currentWindow;
}

const declaredWindows: {
  [windowName: string]: overwolf.windows.WindowInfo;
} = {};
export async function obtainDeclaredWindow(
  windowName: string
): Promise<overwolf.windows.WindowInfo> {
  return new Promise((resolve, reject) => {
    overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
      if (result.success) {
        declaredWindows[windowName] = result.window;
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
        writeLog(`Window ${windowName} restored`);

        resolve(result.window_id!); // window_id is always a string if success
      } else {
        reject(result.error);
      }
    });
  });
}

export async function toggleWindow(windowName: string): Promise<void> {
  const window = await obtainDeclaredWindow(windowName);
  if (['normal', 'maximized'].includes(window.stateEx)) {
    overwolf.windows.hide(window.id);
  } else {
    restoreWindow(window.name);
  }
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

export async function centerWindow(): Promise<void> {
  const currentWindow = await getCurrentWindow();
  const alreadyCentered = getJSONItem<boolean>(
    `centered-${currentWindow.name}`,
    false
  );
  if (alreadyCentered) {
    return;
  }

  const primaryDisplay = currentWindow.name === WINDOWS.OVERLAY;
  setJSONItem(`centered-${currentWindow.name}`, true);
  writeLog(`Window ${currentWindow.name} centered`);

  const monitor = await getMonitor(primaryDisplay);
  if (!monitor) {
    return;
  }

  return new Promise((resolve) => {
    overwolf.windows.changePosition(
      currentWindow.name,
      monitor.x +
        Math.round(
          (monitor.width - (currentWindow.width * monitor.dpiX) / 100) / 2
        ),
      monitor.y +
        Math.round(
          (monitor.height - (currentWindow.height * monitor.dpiY) / 100) / 2
        ),
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
      });
    }
  }
}
