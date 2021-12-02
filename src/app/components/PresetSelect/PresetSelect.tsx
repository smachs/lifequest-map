import { useEffect, useState } from 'react';
import type { Preset } from './presets';
import { staticPresets } from './presets';
import styles from './PresetSelect.module.css';

type PresetSelectProps = {
  value: Preset | null;
  onChange: (value: Preset) => void;
};
function PresetSelect({ value, onChange }: PresetSelectProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (!isFocus) {
      setSearch('');
    }
  }, [value, isFocus]);

  const regExp = new RegExp(search, 'ig');
  const presets = staticPresets.filter((preset) => preset.name.match(regExp));

  return (
    <div className={styles.container}>
      <label className={styles.select}>
        <input
          value={isFocus ? search : value?.name || ''}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Select or create preset..."
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          maxLength={18}
        />
      </label>
      {isFocus && (
        <div className={styles.list}>
          {presets.map((preset) => (
            <button
              key={preset.name}
              className={styles.option}
              onMouseDown={() => onChange(preset)}
            >
              {preset.name}
            </button>
          ))}
          {search && (
            <button className={styles.option}>Create "{search}"</button>
          )}
        </div>
      )}
    </div>
  );
}

export default PresetSelect;
