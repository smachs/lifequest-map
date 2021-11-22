import { classNames } from '../../utils/styles';
import styles from './TierInput.module.css';

type TierInputProps = {
  value: number;
  onChange: (value: number) => void;
};

function TierInput({ value, onChange }: TierInputProps): JSX.Element {
  return (
    <div className={styles.container}>
      {[1, 2, 3, 4, 5].map((tier) => (
        <label
          key={tier}
          className={classNames(styles.label, value === tier && styles.active)}
        >
          {tier}
          <input
            type="radio"
            name="tier"
            checked={value === tier}
            onChange={() => onChange(tier)}
          />
        </label>
      ))}
    </div>
  );
}

export default TierInput;
