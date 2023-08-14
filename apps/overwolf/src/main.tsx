import { PositionProvider } from './contexts/PositionContext';
import styles from './Main.module.css';

import { MantineProvider, Paper, ScrollArea, Stack } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import FAQ from 'ui/components/FAQ/FAQ';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { initPlausible } from 'ui/utils/stats';
import { useUserStore } from 'ui/utils/userStore';
import Ads from './components/Ads/Ads';
import InfluenceIcon from './components/InfluenceIcon/InfluenceIcon';
import Settings from './components/Settings/Settings';
import Streaming from './components/Streaming';
import SyncStatusSender from './components/SyncStatus/SyncStatusSender';
import Welcome from './components/Welcome';
import { closeWindow, getCurrentWindow, WINDOWS } from './utils/windows';

function Sender(): JSX.Element {
  const account = useUserStore((state) => state.account);

  const showAds = !account || !account.isSupporter;
  return (
    <div className={styles.container}>
      <ScrollArea type="auto">
        <Stack p="xs">
          <Paper p="sm">
            <InfluenceIcon />
          </Paper>
          {account ? <Streaming /> : <Welcome />}
          <SyncStatusSender />
          <Settings />
        </Stack>
      </ScrollArea>
      {showAds && <Ads />}
    </div>
  );
}

console.log('Init main');
initMain();
initAppHeader();
initFAQ();
initResizeBorders();

const queryClient = new QueryClient();
const root = createRoot(document.querySelector('#root')!);
root.render(
  <QueryClientProvider client={queryClient}>
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
      withGlobalStyles={false}
    >
      <ThemeProvider>
        <PositionProvider>
          <Sender />
        </PositionProvider>
      </ThemeProvider>
    </MantineProvider>
  </QueryClientProvider>
);

initPlausible();

async function initAppHeader() {
  const currentWindow = await getCurrentWindow();
  let isMaximized = currentWindow.stateEx === 'maximized';
  if (isMaximized) {
    document.body.classList.add('maximized');
  }

  const header = document.querySelector<HTMLElement>('.app-header')!;
  header.onmousedown = () => {
    overwolf.windows.dragMove(currentWindow.id);
  };

  const version = document.querySelector<HTMLElement>('.version')!;
  overwolf.extensions.current.getManifest((manifest) => {
    version.innerText += ` v${manifest.meta.version}`;
  });
  const minimize = document.querySelector<HTMLButtonElement>('#minimize')!;
  minimize.onclick = () => overwolf.windows.minimize(currentWindow.id);
  const maximize = document.querySelector<HTMLButtonElement>('#maximize')!;
  function toggleMaximize() {
    if (isMaximized) {
      overwolf.windows.restore(currentWindow.id);
      document.body.classList.remove('maximized');
      isMaximized = false;
    } else {
      overwolf.windows.maximize(currentWindow.id);
      document.body.classList.add('maximized');
      isMaximized = true;
    }
  }
  maximize.onclick = toggleMaximize;
  header.ondblclick = toggleMaximize;
  const close = document.querySelector<HTMLButtonElement>('#close')!;
  close.onclick = async () => {
    closeWindow(WINDOWS.BACKGROUND);
  };
}

const DEFAULT_SRC = 'www.nw-buddy.de';
async function initMain() {
  const activeSrc = localStorage.getItem('active-src') || DEFAULT_SRC;

  function refreshActiveSrc(src: string) {
    const prevActiveElements =
      document.querySelectorAll<HTMLButtonElement>('.active');
    prevActiveElements.forEach((element) => element.classList.remove('active'));

    const activeElements = document.querySelectorAll<HTMLElement>(
      `[data-src="${src}"]`
    );
    if (activeElements.length === 0) {
      localStorage.setItem('active-src', DEFAULT_SRC);

      refreshActiveSrc(DEFAULT_SRC);
      return;
    }
    activeElements.forEach((element) => {
      element.classList.add('active');
      if (
        element instanceof HTMLIFrameElement &&
        element.src === 'about:blank'
      ) {
        element.src = `https://${src}`;
        if (!src.includes('ref=')) {
          if (src.includes('?')) {
            element.src += `&ref=aeternum_map_overwolf`;
          } else {
            element.src += `?ref=aeternum_map_overwolf`;
          }
        }
      }
    });
  }

  refreshActiveSrc(activeSrc);

  const navButtons =
    document.querySelectorAll<HTMLButtonElement>('.nav-button');
  navButtons.forEach((navButton) => {
    navButton.onclick = () => {
      const src = navButton.getAttribute('data-src')!;
      localStorage.setItem('active-src', src);
      refreshActiveSrc(src);
    };
  });
}

function initFAQ() {
  const root = createRoot(document.querySelector<HTMLElement>('#faq')!);
  root.render(
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
      withGlobalStyles={false}
    >
      <FAQ />
    </MantineProvider>
  );
}

async function initResizeBorders() {
  const currentWindow = await getCurrentWindow();
  const top = document.querySelector<HTMLElement>('.resize.top')!;
  top.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.Top
    );
  };
  const right = document.querySelector<HTMLElement>('.resize.right')!;
  right.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.Right
    );
  };
  const bottom = document.querySelector<HTMLElement>('.resize.bottom')!;
  bottom.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.Bottom
    );
  };
  const left = document.querySelector<HTMLElement>('.resize.left')!;
  left.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.Left
    );
  };
  const topLeft = document.querySelector<HTMLElement>('.resize.top-left')!;
  topLeft.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.TopLeft
    );
  };
  const topRight = document.querySelector<HTMLElement>('.resize.top-right')!;
  topRight.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.TopRight
    );
  };
  const bottomLeft = document.querySelector<HTMLElement>(
    '.resize.bottom-left'
  )!;
  bottomLeft.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.BottomLeft
    );
  };
  const bottomRight = document.querySelector<HTMLElement>(
    '.resize.bottom-right'
  )!;
  bottomRight.onmousedown = () => {
    overwolf.windows.dragResize(
      currentWindow.id,
      overwolf.windows.enums.WindowDragEdge.BottomRight
    );
  };
}
