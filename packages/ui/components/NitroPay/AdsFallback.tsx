import { Box } from '@mantine/core';
import { useEffect } from 'react';
import { trackEvent } from '../../utils/stats';

declare global {
  interface Window {
    Twitch: any;
  }
}

const TWITCH_CHANNELS: string[] = ['dukesloth', 'thehiddengaminglair'];

const AdsFallback = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    let channels = [...TWITCH_CHANNELS];
    const script = loadTwitch();

    script.onload = () => {
      const channel = getRandom(channels);
      channels = channels.filter((c) => c !== channel);
      const twitchEmbed = new window.Twitch.Embed('player', {
        width: '100%',
        height: '100%',
        channel,
        layout: 'video',
        autoplay: true,
        muted: true,
        quality: '160p30',
        parent: ['aeternum-map.gg', 'influence.th.gl'],
      });

      twitchEmbed.addEventListener(window.Twitch.Player.OFFLINE, () => {
        if (channels.length > 0) {
          twitchEmbed.setChannel(getRandom(channels));
        }
      });

      twitchEmbed.addEventListener(window.Twitch.Player.ONLINE, () => {
        trackEvent('Ad Fallback: Twitch', {
          props: { url: `https://www.twitch.tv/${channel}` },
        });
      });

      const REFRESH_INTERVAL = 1000 * 60;
      let lastUpdate = Date.now();
      let timeout = setTimeout(refreshTwitchEmbed, REFRESH_INTERVAL);
      function refreshTwitchEmbed() {
        lastUpdate = Date.now();
        if (
          !(
            twitchEmbed.getPlayerState()?.playback === 'Playing' &&
            twitchEmbed.getDuration() === 0
          )
        ) {
          twitchEmbed.setChannel(
            [...twitchEmbed.getChannel()]
              ?.map((char) =>
                char === char.toUpperCase()
                  ? char.toLowerCase()
                  : char.toUpperCase()
              )
              .join('')
          );
        }
        timeout = setTimeout(refreshTwitchEmbed, REFRESH_INTERVAL);
      }

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          const timeLeft = REFRESH_INTERVAL - (Date.now() - lastUpdate);
          if (timeLeft < 0) {
            refreshTwitchEmbed();
          } else {
            timeout = setTimeout(refreshTwitchEmbed, timeLeft);
          }
        } else {
          clearTimeout(timeout);
        }
      });
    };
    document.body.append(script);

    return () => {
      if (script?.parentNode) {
        script.remove();
      }
    };
  }, []);

  return (
    <div>
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          display: 'block',
          cursor: 'pointer',
          zIndex: 2147483641,
          background: 'rgb(238 238 238)',
          margin: 5,
          padding: '0 5px',
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          opacity: 0.8,
          border: '1px solid rgb(34 34 34)',
          borderRadius: 12,
          color: 'rgb(34 34 34)',
          bottom: 200,
          right: 0,

          '@media screen and (width >= 426px)': {
            bottom: 232,
            right: 7,
          },
        }}
      >
        X
      </Box>
      <Box
        id="player"
        sx={{
          display: 'block',
          zIndex: 2147483640,
          overflow: 'hidden',
          borderRadius: 5,
          height: 200,
          width: '100vw',
          position: 'fixed',
          bottom: 0,
          right: 0,

          '@media screen and (width >= 426px)': {
            width: 400,
            height: 225,
            bottom: 7,
            right: 7,
          },
        }}
      />
    </div>
  );
};

export default AdsFallback;

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadTwitch() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://embed.twitch.tv/embed/v1.js';
  return script;
}
