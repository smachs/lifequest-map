import { usePersistentState } from '../../utils/storage';
import styles from './Settings.module.css';

function Settings(): JSX.Element {
  const [markerSize, setMarkerSize] = usePersistentState('markerSize', 40);
  const [markerBackground, setMarkerBackground] = usePersistentState(
    'markerBackground',
    false
  );

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
          max={100}
        />
      </label>
      <label className={styles.label}>
        Show background
        <input
          type="checkbox"
          checked={markerBackground}
          onChange={(event) => setMarkerBackground(event.target.checked)}
        />
      </label>
    </div>
  );
}

export default Settings;
