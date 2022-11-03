import { useEffect } from 'react';
import { useUserStore } from '../../utils/userStore';

const NitroPay = () => {
  const account = useUserStore((state) => state.account);
  useEffect(() => {
    if (
      account?.hideAds ||
      window.location.href.startsWith('http://localhost')
    ) {
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

  if (account?.hideAds) {
    return <></>;
  }
  return <div id="nitro" />;
};

export default NitroPay;
