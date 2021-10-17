import { useSettings } from '../../contexts/SettingsContext';
import styles from './Settings.module.css';

function Settings(): JSX.Element {
  const {
    markerSize,
    setMarkerSize,
    markerShowBackground,
    setMarkerShowBackground,
  } = useSettings();

  return (
    <div className={styles.container}>
      <h2>Settings</h2>
      <h3>Markers</h3>
      <label className={styles.label}>
        Marker size
        <input
          type="range"
          value={markerSize}
          onChange={(event) => setMarkerSize(+event.target.value)}
          min={10}
          max={80}
        />
      </label>
      <label className={styles.label}>
        Show background
        <input
          type="checkbox"
          checked={markerShowBackground}
          onChange={(event) => setMarkerShowBackground(event.target.checked)}
        />
      </label>
    </div>
  );
}

export default Settings;
