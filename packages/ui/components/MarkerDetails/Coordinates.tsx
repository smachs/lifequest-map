import { copyTextToClipboard } from '../../utils/clipboard';
import CopyIcon from '../icons/CopyIcon';
import styles from './Coordinates.module.css';

type CoordinatesProps = {
  position: [number, number, number];
};
function Coordinates({ position }: CoordinatesProps) {
  const coordinates = `[${position.join(', ')}]`;
  return (
    <p className={styles.container}>
      {coordinates}
      <button
        onClick={() => {
          copyTextToClipboard(coordinates);
        }}
      >
        <CopyIcon />
      </button>
    </p>
  );
}

export default Coordinates;
