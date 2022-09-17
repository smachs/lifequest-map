import { trackOutboundLinkClick } from '../../utils/stats';
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
        <a
          href="https://github.com/lmachens/skeleton"
          target="_blank"
          onClick={() =>
            trackOutboundLinkClick('https://github.com/lmachens/skeleton')
          }
        >
          Skeleton
        </a>{' '}
        to display a minimap in-game 🤘. Keep in mind, that this is definitly in
        the grey area of AGS ToS. Use at own risk 💀!
      </p>
      <p>
        Open{' '}
        <a href="https://aeternum-map.gg" target="_blank">
          https://aeternum-map.gg
        </a>{' '}
        and{' '}
        <a href="https://aeternum-map.gg/minimap.html" target="_blank">
          https://aeternum-map.gg/minimap.html
        </a>{' '}
        in Skeleton instead of your normal browser. Make the minimap
        transparent, always on top, without a frame and clickthroughable.
      </p>
      <h5>Settings</h5>
      <section className={styles.settings}>
        <label>
          URL
          <input disabled value="https://aeternum-map.gg/minimap.html" />
        </label>
        <label>
          Zoom
          <input
            type="range"
            value={minimapZoom}
            min={0}
            max={6}
            step={0.5}
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
