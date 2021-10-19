import { useMemo } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { classNames } from '../../utils/styles';
import styles from './Checkbox.module.css';

export type CheckboxProps = {
  imgSrc?: string;
  title: string;
  checked: boolean;
  className?: string;
  countType?: string;
  onChange: (checked: boolean) => void;
};

function Checkbox({
  imgSrc,
  title,
  checked,
  className,
  countType,
  onChange,
}: CheckboxProps): JSX.Element {
  const { markers } = useMarkers();

  const count = useMemo(
    () => markers.filter((marker) => marker.type === countType).length,
    [markers, countType]
  );

  return (
    <label
      className={classNames(
        className,
        styles.filter,
        checked && styles.checked
      )}
    >
      <input
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
        checked={checked}
      />
      {imgSrc && <img src={imgSrc} alt="" />}
      {title}
      <span>{countType && count}</span>
    </label>
  );
}

export default Checkbox;
