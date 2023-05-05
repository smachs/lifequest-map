import { useEffect } from 'react';
import { trackEvent } from '../../utils/stats';
import styles from './AdsFallback.module.css';

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

const TWITCH_CHANNELS = ['DannehTV'];
const YT_VIDEO_IDS = ['YxbMrdL97xE'];

const AdsFallback = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    let script = loadTwitch({
      onOffline: () => {
        script.remove();
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
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <div className={styles.close} onClick={onClose}>
        X
      </div>
      <div id="player" className={styles.floating} />
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
      layout: 'video',
      autoplay: true,
      muted: true,
      parent: ['aeternum-map.gg'],
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
