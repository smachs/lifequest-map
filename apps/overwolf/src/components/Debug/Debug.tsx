import { useEffect, useState } from 'react';
import { copyTextToClipboard } from 'ui/utils/clipboard';
import { getGameInfo } from '../../utils/games';
import {
  getLocation,
  getScreenshotFromNewWorld,
  toLocation,
} from '../../utils/ocr';
import styles from './Debug.module.css';

const Debug = () => {
  const [ocrUrl, setOcrUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [locationString, setLocationString] = useState<null | string>(null);
  const [location, setLocation] = useState<null | [number, number]>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const startTimeout = () => {
      timeoutId = setTimeout(() => {
        getScreenshotFromNewWorld()
          .then((ocrUrl) => {
            setOcrUrl(ocrUrl);
            getLocation(ocrUrl).then((locationString) => {
              setLocationString(locationString);
              setLocation(toLocation(locationString));
            });
          })
          .catch((error) => setErrorMessage(error.message))
          .finally(startTimeout);
      }, 1000);
    };
    startTimeout();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <>
      <h4>OCR preview (Please focus New World)</h4>
      {ocrUrl ? (
        <img
          src={ocrUrl}
          alt="OCR"
          onError={() => setErrorMessage('Can not load image')}
          className={styles.ocr}
        />
      ) : (
        'Waiting for image'
      )}
      <div>{locationString || 'No location string'}</div>
      <div>{location ? `[${location[1]}, ${location[0]}]` : 'No location'}</div>
      {errorMessage && <div>Last error: {errorMessage}</div>}
      <h4>Debug</h4>
      <button
        onClick={() => {
          getGameInfo().then((result) =>
            copyTextToClipboard(JSON.stringify(result, null, 2))
          );
        }}
        className={styles.dump}
      >
        Copy game info
      </button>
    </>
  );
};

export default Debug;
