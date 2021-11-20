import { usePersistentState } from '../../utils/storage';
import styles from './MinimapSetup.module.css';

function MinimapWebsite(): JSX.Element {
  const [minimapOpacity, setMinimapOpacity] = usePersistentState(
    'minimapOpacity',
    80
  );
  const [minimapBorderRadius, setMinimapBorderRadius] = usePersistentState(
    'minimapBorderRadius',
    50
  );
  const [minimapZoom, setMinimapZoom] = usePersistentState('minimapZoom', 5);
  const [rotateMinimap, setRotateMinimap] = usePersistentState(
    'rotateMinimap',
    false
  );

  return (
    <>
      <p>
        You can use{' '}
        <a href="https://github.com/LorenzCK/OnTopReplica" target="_blank">
          OnTopReplica
        </a>{' '}
        to display a minimap in-game 🤘.
      </p>
      <p>
        After installing and configurating (Make sure to enable "clickthrough"),
        open the{' '}
        <a href="/minimap.html" target="_blank">
          minimap view
        </a>
        .
      </p>
      <h5>Settings</h5>
      <section className={styles.settings}>
        <label>
          URL
          <input disabled value={`${location.origin}/minimap.html`} />
        </label>
        <label>
          Zoom
          <input
            type="range"
            value={minimapZoom}
            min={0}
            max={6}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => setMinimapZoom(+event.target.value)}
          />
        </label>
        <label>
          Border
          <input
            type="range"
            value={minimapBorderRadius}
            min={0}
            max={50}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => setMinimapBorderRadius(+event.target.value)}
          />
        </label>
        <label>
          Opacity
          <input
            type="range"
            value={minimapOpacity}
            min={20}
            max={100}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => setMinimapOpacity(+event.target.value)}
          />
        </label>
        <label>
          Rotate minimap
          <input
            type="checkbox"
            checked={rotateMinimap}
            onMouseDown={(event) => event.stopPropagation()}
            onChange={(event) => setRotateMinimap(event.target.checked)}
          />
        </label>
      </section>
    </>
  );
}

export default MinimapWebsite;
