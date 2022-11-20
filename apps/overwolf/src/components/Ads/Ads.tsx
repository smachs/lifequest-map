import { Anchor } from '@mantine/core';
import type { OwAd } from '@overwolf/types/owads';
import { useEffect, useRef, useState } from 'react';
import useWindowIsVisible from '../useWindowIsVisible';
import classes from './Ads.module.css';

declare global {
  interface Window {
    OwAd?: typeof OwAd;
  }
}

function Ads(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [owAd, setOwAd] = useState<OwAd>();
  const isDisplayedFirstTime = useRef(true);
  const windowIsVisible = useWindowIsVisible();

  useEffect(() => {
    if (owAd) {
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
  }, [owAd]);

  useEffect(() => {
    if (!owAd) {
      return;
    }
    if (isDisplayedFirstTime.current) {
      isDisplayedFirstTime.current = false;
      return;
    }

    if (windowIsVisible) {
      owAd.refreshAd({});
    } else {
      owAd.removeAd();
    }
  }, [owAd, windowIsVisible]);

  return (
    <aside className={classes.container}>
      <div className={classes.text}>
        Ads support the development of this app.
        <br />
        Become a supporter to deactivate ads 🤘.
      </div>
      <div ref={containerRef} className={classes.ads} />
    </aside>
  );
}

export default Ads;
