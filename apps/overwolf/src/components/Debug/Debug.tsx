import { Button, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSettings } from 'ui/contexts/SettingsContext';
import { copyTextToClipboard } from 'ui/utils/clipboard';
import { getGameInfo } from '../../utils/games';
import {
  getLocation,
  getScreenshotFromNewWorld,
  toLocation,
} from '../../utils/ocr';
import styles from './Debug.module.css';

const Debug = () => {
  const [ocrUrl, setOcrUrl] = useState<string | null>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [locationString, setLocationString] = useState<null | string>(null);
  const [location, setLocation] = useState<null | [number, number]>(null);
  const { ocr } = useSettings();

  useEffect(() => {
    if (!ocr) {
      return;
    }
    let timeoutId: NodeJS.Timeout | null = null;
    const startTimeout = () => {
      timeoutId = setTimeout(() => {
        getScreenshotFromNewWorld()
          .then((ocrUrl) => {
            setOcrUrl(ocrUrl);
            if (ocrUrl) {
              getLocation(ocrUrl).then((locationString) => {
                setLocationString(locationString);
                setLocation(toLocation(locationString));
              });
            } else {
              setLocationString(null);
              setLocation(null);
            }
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
  }, [ocr]);

  return (
    <>
      <Title order={4}>OCR preview (Focus New World)</Title>
      {ocrUrl ? (
        <img
          src={ocrUrl}
          alt="OCR"
          onError={() => setErrorMessage('Can not load image')}
          className={styles.ocr}
        />
      ) : !ocr ? (
        'Please enable OCR'
      ) : (
        'Waiting for image'
      )}
      <div>{locationString || 'No location string'}</div>
      <div>{location ? `[${location[1]}, ${location[0]}]` : 'No location'}</div>
      {errorMessage && <div>Last error: {errorMessage}</div>}
      <h4>Debug</h4>
      <Button
        onClick={() => {
          getGameInfo().then((result) =>
            copyTextToClipboard(JSON.stringify(result, null, 2))
          );
        }}
      >
        Copy game info
      </Button>
    </>
  );
};

export default Debug;
