import type { OwAd } from '@overwolf/types/owads';
import { useEffect, useRef, useState } from 'react';
import { trackOutboundLinkClick } from 'ui/utils/stats';
import classes from './Ads.module.css';

declare global {
  interface Window {
    OwAd?: typeof OwAd;
  }
}

function Ads(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    function onOwAdReady() {
      if (typeof window.OwAd === 'undefined' || containerRef.current === null) {
        return;
      }
      const owAd = new window.OwAd(containerRef.current, {
        size: { width: 400, height: 300 },
      });

      owAd.addEventListener('display_ad_loaded', () => {
        setIsPlaying(true);
      });

      owAd.addEventListener('impression', () => {
        setIsPlaying(true);
      });

      owAd.addEventListener('complete', () => {
        setIsPlaying(false);
      });
      owAd.addEventListener('error', () => {
        setIsPlaying(false);
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
      {!isPlaying && (
        <div className={classes.fallback}>
          <a
            href="https://youtu.be/YcrwMXjwfRc"
            target="_blank"
            onClick={() =>
              trackOutboundLinkClick('https://youtu.be/YcrwMXjwfRc')
            }
          >
            <img
              src="/thumbnails/flame_core_farm.webp"
              alt=""
              className={classes.fallbackImage}
            />
          </a>
        </div>
      )}
      <div
        ref={containerRef}
        className={classes.ads}
        style={isPlaying ? {} : { pointerEvents: 'none' }}
      />
    </aside>
  );
}

export default Ads;
