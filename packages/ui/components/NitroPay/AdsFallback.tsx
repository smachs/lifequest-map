import { Box } from '@mantine/core';
import { useEffect } from 'react';
import { trackEvent } from '../../utils/stats';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: any;
      PlayerState: any;
    };
    Twitch: any;
  }
}

const TWITCH_CHANNELS: string[] = ['DannehTV'];
const YT_VIDEO_IDS: string[] = [];

const AdsFallback = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    let script = loadTwitch({
      onOffline: () => {
        script.remove();
        if (YT_VIDEO_IDS.length === 0) {
          return;
        }
        script = loadYouTube({
          onPlay: (videoId) => {
            trackEvent('Ad Fallback: YouTube Play', {
              props: { url: `https://www.youtube.com/watch?v=${videoId}` },
            });
          },
          onReady: (videoId) => {
            trackEvent('Ad Fallback: YouTube Ready', {
              props: { url: `https://www.youtube.com/watch?v=${videoId}` },
            });
          },
        });
        document.body.append(script);
      },
      onOnline: (channel) => {
        trackEvent('Ad Fallback: Twitch', {
          props: { url: `https://www.twitch.tv/${channel}` },
        });
      },
    });

    document.body.append(script);

    return () => {
      if (script.parentNode) {
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
            bottom: 207,
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
            width: 361,
            height: 203,
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

function loadTwitch({
  onOnline,
  onOffline,
}: {
  onOnline: (channel: string) => void;
  onOffline: (channel: string) => void;
}) {
  const channel = getRandom(TWITCH_CHANNELS);
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://embed.twitch.tv/embed/v1.js';
  script.onload = () => {
    const twitchEmbed = new window.Twitch.Embed('player', {
      width: '100%',
      height: '100%',
      channel,
      layout: 'video-with-chat',
      autoplay: true,
      muted: true,
      parent: ['aeternum-map.gg', 'influence.th.gl'],
    });

    twitchEmbed.addEventListener(window.Twitch.Player.OFFLINE, () => {
      onOffline(channel);
    });

    twitchEmbed.addEventListener(window.Twitch.Player.ONLINE, () => {
      onOnline(channel);
    });
  };

  return script;
}

function loadYouTube({
  onPlay,
  onReady,
}: {
  onPlay: (videoId: string) => void;
  onReady: (videoId: string) => void;
}) {
  const videoId = getRandom(YT_VIDEO_IDS);
  let played = false;
  window.onYouTubeIframeAPIReady = function () {
    const player = new window.YT.Player('player', {
      videoId,
      playerVars: {
        playsinline: 1,
        loop: 1,
        autoplay: 0,
      },
      events: {
        onReady: () => {
          onReady(videoId);
          player.mute();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            if (!played) {
              onPlay(videoId);
            }
            played = true;
          }
        },
      },
    });
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.youtube.com/iframe_api';
  return script;
}
