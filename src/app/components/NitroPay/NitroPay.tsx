import { useEffect } from 'react';
import styles from './NitroPay.module.css';

const NitroPay = () => {
  useEffect(() => {
    // @ts-ignore
    window['nitroAds'].createAd('nitro', {
      format: 'video-nc',
      video: {
        float: 'always',
      },
    });
  }, []);

  return <div id="nitro" className={styles.container} />;
};

export default NitroPay;
