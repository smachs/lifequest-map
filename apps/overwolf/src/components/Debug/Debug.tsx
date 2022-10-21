import { useEffect, useState } from 'react';
import { copyTextToClipboard } from 'ui/utils/clipboard';
import { getGameInfo } from 'ui/utils/games';
import { getLocation, getScreenshotFromNewWorld } from '../../utils/ocr';
import styles from './Debug.module.css';

const Debug = () => {
  const [ocrUrl, setOcrUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [location, setLocation] = useState<null | [number, number]>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const startTimeout = () => {
      timeoutId = setTimeout(() => {
        getScreenshotFromNewWorld()
          .then(setOcrUrl)
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

  useEffect(() => {
    if (ocrUrl) {
      getLocation(ocrUrl)
        .then(setLocation)
        .then(() => setErrorMessage(''))
        .catch((error) => setErrorMessage(error.message));
    }
  }, [ocrUrl]);

  return (
    <>
      <h4>OCR preview</h4>
      {!ocrUrl && !errorMessage && <div>Please focus New World</div>}
      {ocrUrl && (
        <img
          src={ocrUrl}
          alt="OCR"
          onError={() => setErrorMessage('Can not load image')}
          className={styles.ocr}
        />
      )}
      {location && (
        <div>
          [{location[1]}, {location[0]}]
        </div>
      )}
      {errorMessage && <div>{errorMessage}</div>}
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
