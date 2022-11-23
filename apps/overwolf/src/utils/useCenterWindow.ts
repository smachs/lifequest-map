import { useEffect } from 'react';
import { getCurrentWindow } from 'ui/utils/windows';
import { useNewWorldGameInfo } from '../components/store';

const useCenterWindow = () => {
  const newWorldGameInfo = useNewWorldGameInfo();

  useEffect(() => {
    (async () => {
      if (!newWorldGameInfo?.isRunning) {
        return;
      }
      const currentWindow = await getCurrentWindow();
      const x = newWorldGameInfo.logicalWidth / 2 - currentWindow.width / 2;
      const y = newWorldGameInfo.logicalHeight / 2 - currentWindow.height / 2;

      overwolf.windows.changePosition(currentWindow.id, x, y);
    })();
  }, [
    newWorldGameInfo?.isRunning,
    newWorldGameInfo?.logicalWidth,
    newWorldGameInfo?.logicalHeight,
  ]);
};

export default useCenterWindow;
