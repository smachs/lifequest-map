import { Anchor, Box, CloseButton } from '@mantine/core';
import { useEffect } from 'react';
import { trackEvent } from '../../utils/stats';

declare global {
  interface Window {
    Twitch: any;
  }
}

const CHANNEL = 'hiroomirash';

const AdsFallback = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const script = loadTwitch();

    script.onload = () => {
      const twitchEmbed = new window.Twitch.Player('player', {
        channel: CHANNEL,
        width: 320,
        height: 180,
        muted: true,
        autoplay: true,
        showMature: false,
        quality: '160p30',
        controls: false,
        // parent: ['aeternum-map.th.gl', 'influence.th.gl'],
      });

      twitchEmbed.addEventListener(window.Twitch.Player.ONLINE, () => {
        trackEvent('Ad Fallback: Twitch', {
          props: { url: `https://www.twitch.tv/${CHANNEL}` },
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
        id="player"
        sx={{
          zIndex: 2147483640,
          overflow: 'hidden',
          borderRadius: 5,
          height: 180,
          width: 320,
          position: 'fixed',
          bottom: 4,
          right: 4,

          ':hover > div': {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2147483641,
            background: 'rgb(0 0 0 / 0.5)',
            padding: '4px 8px',
            fontSize: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            '@media screen and (width >= 768px)': {
              opacity: 0,
            },
          }}
        >
          <span>
            Hosting{' '}
            <Anchor
              weight="bold"
              href="https://www.twitch.tv/hiroomirash?tt_content=channel_name&tt_medium=embed"
              target="_blank"
            >
              Kode Hiro
            </Anchor>{' '}
            in São Paulo, Brazil.
          </span>
          <CloseButton onClick={onClose} />
        </Box>
      </Box>
    </div>
  );
};

export default AdsFallback;

function loadTwitch() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://embed.twitch.tv/embed/v1.js';
  return script;
}
