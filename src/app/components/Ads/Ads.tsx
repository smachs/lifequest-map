import type { OwAd } from '@overwolf/types/owads';
import { useEffect, useRef, useState } from 'react';
import { getCurrentWindow } from '../../utils/windows';
import classes from './Ads.module.css';
import { NEW_WORLD_CLASS_ID } from '../../utils/games';

type AdsProps = {
  active: boolean;
};

function Ads({ active }: AdsProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [owAd, setOwAd] = useState<OwAd>();
  const isDisplayedFirstTime = useRef(true);

  useEffect(() => {
    if (!active || owAd) {
      return;
    }

    function onOwAdReady() {
      if (typeof window.OwAd === 'undefined' || containerRef.current === null) {
        return;
      }
      const ad = new window.OwAd(containerRef.current, {
        size: { width: 400, height: 300 },
      });
      ad.addEventListener('ow_internal_rendered', () => {
        setOwAd(ad);
      });
    }

    const script = document.createElement('script');
    script.src = 'https://content.overwolf.com/libs/ads/latest/owads.min.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = onOwAdReady;
    return () => {
      document.body.removeChild(script);
    };
  }, [active, owAd]);

  useEffect(() => {
    if (!owAd || !active) {
      return;
    }
    async function handleWindowStateChanged(
      state: overwolf.windows.WindowStateChangedEvent
    ) {
      const currentWindow = await getCurrentWindow();
      if (currentWindow.id !== state.window_id) {
        return;
      }
      if (
        state.window_state_ex === 'minimized' ||
        state.window_state_ex === 'hidden'
      ) {
        owAd!.removeAd();
      } else if (
        (state.window_previous_state_ex === 'minimized' ||
          state.window_previous_state_ex === 'hidden') &&
        (state.window_state_ex === 'normal' ||
          state.window_state_ex === 'maximized')
      ) {
        owAd!.refreshAd({});
      }
    }
    async function handleGameInfoUpdated(
      res: overwolf.games.GameInfoUpdatedEvent
    ) {
      const currentWindow = await getCurrentWindow();
      if (currentWindow.name !== 'overlay') {
        return;
      }
      const { gameInfo, focusChanged } = res;
      if (gameInfo && gameInfo.classId === NEW_WORLD_CLASS_ID && focusChanged) {
        if (gameInfo.isInFocus) {
          owAd!.refreshAd({});
        } else {
          owAd!.removeAd();
        }
      }
    }

    if (!isDisplayedFirstTime.current) {
      owAd.refreshAd({});
    }
    isDisplayedFirstTime.current = false;

    overwolf.windows.onStateChanged.addListener(handleWindowStateChanged);
    overwolf.games.onGameInfoUpdated.addListener(handleGameInfoUpdated);

    return () => {
      owAd!.removeAd();
      overwolf.windows.onStateChanged.removeListener(handleWindowStateChanged);
      overwolf.games.onGameInfoUpdated.removeListener(handleGameInfoUpdated);
    };
  }, [owAd, active]);

  return (
    <aside className={classes.container}>
      <div className={classes.text}>
        Ads support the development of this app
      </div>
      <div ref={containerRef} className={classes.ads} />
    </aside>
  );
}

export default Ads;
