import type { OwAd } from '@overwolf/types/owads';
import { useEffect, useRef } from 'react';
import classes from './Ads.module.css';

declare global {
  interface Window {
    OwAd?: typeof OwAd;
  }
}

function Ads(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onOwAdReady() {
      if (typeof window.OwAd === 'undefined' || containerRef.current === null) {
        return;
      }
      new window.OwAd(containerRef.current, {
        size: { width: 400, height: 300 },
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
  }, []);

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
