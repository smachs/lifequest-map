/*eslint prefer-rest-params: "off"*/

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useAccountStore } from '../../utils/account';
import AdsFallback from './AdsFallback';

type NitroAd = {
  createAd: (name: string, options: unknown) => void;
  addUserToken: (token: string) => void;
  queue: any[];
};

declare global {
  interface Window {
    nitroAds: NitroAd;
  }
}

window.nitroAds = window.nitroAds || {
  createAd: function () {
    window.nitroAds.queue.push(['createAd', arguments]);
  },
  addUserToken: function () {
    window.nitroAds.queue.push(['addUserToken', arguments]);
  },
  queue: [],
};

const NitroPay = () => {
  const accountStore = useAccountStore();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let userId = Cookies.get('userId');
    const refreshState = async () => {
      if (!userId) {
        const state = useAccountStore.getState();
        if (state.isPatron) {
          accountStore.setIsPatron(false);
        }
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_PATREON_BASE_URI
        }/api/patreon?appId=bemfloapmmjpmdmjfjgegnacdlgeapmkcmcmceei`,
        { credentials: 'include' }
      );
      try {
        const body = await response.json();
        if (!response.ok) {
          console.warn(body);
          accountStore.setIsPatron(false);
        } else {
          console.log(`Patreon successfully activated`);
          accountStore.setIsPatron(true, userId);
        }
      } catch (err) {
        console.error(err);
        accountStore.setIsPatron(false);
      }
    };
    refreshState();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const newUserId = Cookies.get('userId');
        if (newUserId !== userId) {
          userId = newUserId;
          refreshState();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (
      navigator.userAgent.includes('Overwolf') ||
      accountStore.isPatron ||
      location.href === 'http://localhost:3001/'
    ) {
      return;
    }

    window['nitroAds'].createAd('am-video', {
      format: 'video-nc',
      video: {
        float: 'always',
      },
    });

    const script = document.createElement('script');
    script.src = 'https://s.nitropay.com/ads-1487.js';
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-log-level', 'silent');
    script.async = true;

    const timeoutId = setTimeout(() => {
      setShowFallback(true);
    }, 1500);

    script.onload = () => {
      clearTimeout(timeoutId);
      setShowFallback(false);
    };

    document.body.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
      document.body.removeChild(script);
    };
  }, []);

  if (accountStore.isPatron) {
    return <></>;
  }

  return (
    <>
      {showFallback && <AdsFallback onClose={() => setShowFallback(false)} />}
      <div id="am-video" />
    </>
  );
};

export default NitroPay;
