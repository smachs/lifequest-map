import { useEffect } from 'react';
import { useNewWorldGameInfo } from '../components/store';
import { getCurrentWindow } from './windows';

const useCenterWindow = () => {
  const newWorldGameInfo = useNewWorldGameInfo();

  useEffect(() => {
    (async () => {
      if (!newWorldGameInfo?.isRunning) {
        return;
      }
      const currentWindow = await getCurrentWindow();
      // @ts-ignore (dpiScale is not documentated)
      const dpiScale = currentWindow.dpiScale ?? 1;
      const x = Math.floor(
        (newWorldGameInfo.logicalWidth / 2 - currentWindow.width / 2) / dpiScale
      );
      const y = Math.floor(
        (newWorldGameInfo.logicalHeight / 2 - currentWindow.height / 2) /
          dpiScale
      );
      overwolf.windows.changePosition(currentWindow.id, x, y);
    })();
  }, [
    newWorldGameInfo?.isRunning,
    newWorldGameInfo?.logicalWidth,
    newWorldGameInfo?.logicalHeight,
  ]);
};

export default useCenterWindow;
