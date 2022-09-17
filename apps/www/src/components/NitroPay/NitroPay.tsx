import { useEffect } from 'react';
import { useAccount } from '../../contexts/UserContext';

const NitroPay = () => {
  const { account } = useAccount();
  useEffect(() => {
    if (account?.hideAds) {
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
