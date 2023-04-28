import { useEffect } from 'react';
import {
  trackAdFallbackTwitch,
  trackAdFallbackYoutube,
} from '../../utils/stats';
import styles from './AdsFallback.module.css';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: any;
    };
    Twitch: any;
  }
}

const TWITCH_CHANNELS = ['DannehTV'];
const YT_VIDEO_IDS = ['YcrwMXjwfRc', 'T6ACP35fsWg'];

const AdsFallback = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    let script = loadTwitch({
      onOffline: () => {
        script.remove();
        script = loadYouTube({
          onPlay: (videoId) => {
            trackAdFallbackYoutube(
              `https://www.youtube.com/watch?v=${videoId}`
            );
          },
        });
        document.body.append(script);
      },
      onOnline: (channel) => {
        trackAdFallbackTwitch(`https://www.twitch.tv/${channel}`);
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
      // Only needed if this page is going to be embedded on other websites
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

function loadYouTube({ onPlay }: { onPlay: (videoId: string) => void }) {
  const videoId = getRandom(YT_VIDEO_IDS);
  window.onYouTubeIframeAPIReady = function () {
    const player = new window.YT.Player('player', {
      videoId,
      playerVars: {
        playsinline: 1,
        loop: 1,
      },
      events: {
        onReady: () => {
          player.mute();
          player.playVideo();
          onPlay(videoId);
        },
      },
    });
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.youtube.com/iframe_api';
  return script;
}
