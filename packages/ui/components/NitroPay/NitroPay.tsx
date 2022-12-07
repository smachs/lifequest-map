import { useEffect } from 'react';
import { isNWGuide } from '../../utils/routes';
import { useUserStore } from '../../utils/userStore';

const NitroPay = () => {
  const account = useUserStore((state) => state.account);
  useEffect(() => {
    if (isNWGuide || account?.isSupporter) {
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

  if (account?.isSupporter || isNWGuide) {
    return <></>;
  }
  return <div id="nitro" />;
};

export default NitroPay;
