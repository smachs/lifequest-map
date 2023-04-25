import { useEffect, useState } from 'react';
import { useUserStore } from '../../utils/userStore';
import AdsFallback from './AdsFallback';

const NitroPay = () => {
  const account = useUserStore((state) => state.account);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (navigator.userAgent.includes('Overwolf') || account?.isSupporter) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s.nitropay.com/ads-1042.js';
    script.setAttribute('data-cfasync', 'false');
    script.async = true;

    const timeoutId = setTimeout(() => {
      setShowFallback(true);
    }, 1000);

    script.onload = () => {
      clearTimeout(timeoutId);
      setShowFallback(false);
      // @ts-ignore
      window['nitroAds'].createAd('nitro', {
        format: 'video-nc',
        video: {
          float: 'always',
        },
      });
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      setShowFallback(true);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (account?.isSupporter) {
    return <></>;
  }
  if (showFallback) {
    return <AdsFallback onClose={() => setShowFallback(false)} />;
  }
  return <div id="nitro" />;
};

export default NitroPay;
