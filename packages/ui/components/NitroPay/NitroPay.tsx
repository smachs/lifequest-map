import { useEffect } from 'react';
import { useUserStore } from '../../utils/userStore';

const NitroPay = () => {
  const account = useUserStore((state) => state.account);
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
  }, []);

  if (account?.isSupporter) {
    return <></>;
  }
  return <div id="nitro" />;
};

export default NitroPay;
