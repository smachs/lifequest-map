import { useEffect, useState } from 'react';
import { getCurrentWindow, getWindowState } from '../utils/windows';

function useWindowIsVisible(windowName?: string) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!windowName) {
      getCurrentWindow().then((result) => {
        setIsVisible(
          result.stateEx === 'normal' || result.stateEx === 'maximized'
        );
      });
    } else {
      getWindowState(windowName).then((result) => {
        setIsVisible(
          result.window_state_ex === 'normal' ||
            result.window_state_ex === 'maximized'
        );
      });
    }

    const handleWindowStateChanged = async (
      state: overwolf.windows.WindowStateChangedEvent
    ) => {
      if (windowName) {
        if (windowName !== state.window_name) {
          return;
        }
      } else {
        const currentWindow = await getCurrentWindow();
        if (currentWindow.id !== state.window_id) {
          return;
        }
      }
      if (
        state.window_state_ex === 'minimized' ||
        state.window_state_ex === 'hidden' ||
        state.window_state_ex === 'closed'
      ) {
        setIsVisible(false);
      } else if (
        (state.window_previous_state_ex === 'minimized' ||
          state.window_previous_state_ex === 'hidden' ||
          state.window_previous_state_ex === 'closed') &&
        (state.window_state_ex === 'normal' ||
          state.window_state_ex === 'maximized')
      ) {
        setIsVisible(true);
      }
    };

    overwolf.windows.onStateChanged.addListener(handleWindowStateChanged);
    return () => {
      overwolf.windows.onStateChanged.removeListener(handleWindowStateChanged);
    };
  }, []);

  return isVisible;
}

export default useWindowIsVisible;
