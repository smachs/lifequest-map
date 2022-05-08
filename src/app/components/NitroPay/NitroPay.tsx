import { useEffect } from 'react';
import { useAccount } from '../../contexts/UserContext';
import styles from './NitroPay.module.css';

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
  return <div id="nitro" className={styles.container} />;
};

export default NitroPay;
