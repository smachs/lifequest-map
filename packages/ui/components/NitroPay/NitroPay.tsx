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

    // @ts-ignore
    window['nitroAds'].createAd('nitro', {
      format: 'video-nc',
      video: {
        float: 'always',
      },
    });

    const timeoutId = setTimeout(() => {
      // @ts-ignore
      if (window['nitroAds'].loaded) {
        return;
      }
      setShowFallback(true);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
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
