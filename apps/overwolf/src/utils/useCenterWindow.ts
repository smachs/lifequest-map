import { useEffect } from 'react';
import { getCurrentWindow } from 'ui/utils/windows';
import { getNewWorldRunning } from './games';

const useCenterWindow = () => {
  useEffect(() => {
    (async () => {
      const newWorld = await getNewWorldRunning();
      if (!newWorld) {
        return;
      }
      const currentWindow = await getCurrentWindow();
      const x = newWorld.logicalWidth / 2 - currentWindow.width / 2;
      const y = newWorld.logicalHeight / 2 - currentWindow.height / 2;

      overwolf.windows.changePosition(currentWindow.id, x, y);
    })();
  }, []);
};

export default useCenterWindow;
