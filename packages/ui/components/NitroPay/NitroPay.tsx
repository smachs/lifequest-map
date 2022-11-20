import { useEffect } from 'react';
import { useUserStore } from '../../utils/userStore';

const NitroPay = () => {
  const account = useUserStore((state) => state.account);
  useEffect(() => {
    if (
      account?.isSupporter ||
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

  if (account?.isSupporter) {
    return <></>;
  }
  return <div id="nitro" />;
};

export default NitroPay;
