import { useEffect, useRef, useState } from 'react';
import { notify } from '../../utils/notifications';
import { classNames } from '../../utils/styles';
import { useUserStore } from '../../utils/userStore';
import { uploadScreenshot } from './api';
import styles from './UploadScreenshot.module.css';

type UploadScreenshotProps = {
  onUpload: (path?: string) => void;
};
function UploadScreenshot({ onUpload }: UploadScreenshotProps): JSX.Element {
  const account = useUserStore((state) => state.account);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !screenshot) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
    };
    image.src = screenshot;
  }, [canvasRef.current, screenshot]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files![0];
    setScreenshot(URL.createObjectURL(file));
  }

  async function handleUpload() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (!screenshot) {
      onUpload();
    } else {
      setIsUploading(true);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          return;
        }
        const result = await notify(uploadScreenshot(blob));
        onUpload(result.screenshotId);
        setIsUploading(false);
      });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.preview}>
        <div className={styles.actions}>
          <label
            className={classNames(styles.action, !account && styles.disabled)}
          >
            Choose file
            <input
              disabled={!account}
              className={styles.hidden}
              type="file"
              onChange={handleChange}
              accept="image/*"
              name="screenshot"
            />
          </label>
        </div>
        <div>
          {account
            ? 'A screenshot helps other players to find this resource.'
            : 'Please login to upload a screenshot.'}
        </div>
        <canvas ref={canvasRef} className={styles.screenshot} />
      </div>
      <button
        onClick={handleUpload}
        className={styles.upload}
        disabled={isUploading}
      >
        {!screenshot ? 'Skip screenshot' : 'Save'}
      </button>
    </div>
  );
}

export default UploadScreenshot;
