import type { MarkerSize } from 'static';
import { classNames } from '../../utils/styles';
import styles from './Input.module.css';

type SizeInputProps = {
  value: MarkerSize;
  sizes: MarkerSize[];
  onChange: (value: MarkerSize) => void;
};

function SizeInput({ value, onChange, sizes }: SizeInputProps): JSX.Element {
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
