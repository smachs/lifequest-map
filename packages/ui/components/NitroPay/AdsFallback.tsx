import { useEffect } from 'react';
import { trackAdFallbackYoutube } from '../../utils/stats';
import styles from './AdsFallback.module.css';

const VIDEO_ID = 'YcrwMXjwfRc';
const AdsFallback = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.youtube.com/iframe_api';
    // @ts-ignore
    window.onYouTubeIframeAPIReady = function () {
      // @ts-ignore
      const player = new YT.Player('player', {
        videoId: VIDEO_ID,
        playerVars: {
          playsinline: 1,
          loop: 1,
        },
        events: {
          onReady: () => {
            player.mute();
            player.playVideo();
            trackAdFallbackYoutube(
              `https://www.youtube.com/watch?v=${VIDEO_ID}`
            );
          },
        },
      });
    };

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
