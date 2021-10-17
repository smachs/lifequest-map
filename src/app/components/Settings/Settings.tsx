import styles from './Settings.module.css';

function Settings(): JSX.Element {
  return (
    <div className={styles.container}>
      <h2>Settings</h2>
      <h3>Markers</h3>
      <label className={styles.label}>
        Marker size
        <input type="range" />
      </label>
      <label className={styles.label}>
        Show background
        <input type="checkbox" />
      </label>
    </div>
  );
}

export default Settings;
