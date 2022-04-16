import type { MarkerSize } from '../../../lib/markers/types';
import { classNames } from '../../utils/styles';
import styles from './Input.module.css';

type SizeInputProps = {
  value: MarkerSize;
  onChange: (value: MarkerSize) => void;
};

export const sizes: MarkerSize[] = ['S', 'M', 'L', '?'];
function SizeInput({ value, onChange }: SizeInputProps): JSX.Element {
  return (
    <div className={styles.container}>
      {sizes.map((size) => (
        <label
          key={size}
          className={classNames(styles.label, value === size && styles.active)}
        >
          {size}
          <input
            type="radio"
            name="size"
            checked={value === size}
            onChange={() => onChange(size)}
          />
        </label>
      ))}
    </div>
  );
}

export default SizeInput;
