import { useEffect, useState } from 'react';
import type { Preset } from './presets';
import { staticPresets } from './presets';
import styles from './PresetSelect.module.css';

type PresetSelectProps = {
  value: Preset | null;
  onChange: (value: Preset) => void;
};
function PresetSelect({ value, onChange }: PresetSelectProps): JSX.Element {
  const [newName, setNewName] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (!isFocus) {
      setNewName('');
    }
  }, [value, isFocus]);

  return (
    <div className={styles.container}>
      <label>
        <input
          value={isFocus ? newName : value?.name || ''}
          onChange={(event) => setNewName(event.target.value)}
          placeholder={isFocus ? 'Enter new preset name' : 'Select preset'}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
        />
      </label>
      {isFocus && (
        <div className={styles.list}>
          {newName ? (
            <button>➕ {newName}</button>
          ) : (
            staticPresets.map((preset) => (
              <button key={preset.name} onMouseDown={() => onChange(preset)}>
                {preset.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PresetSelect;
