import { useState } from 'react';
import useGeoman from './useGeoman';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectPosition.module.css';
import type { FilterItem } from '../MapFilter/mapFilters';
import type { Details } from './AddResources';
import { getJSONItem } from '../../utils/storage';

type SelectPositionType = {
  details: Details;
  filter: FilterItem;
  onSelectPosition: (position: [number, number, number]) => void;
  onSelectPositions: (positions: [number, number][]) => void;
};
function SelectPosition({
  details,
  filter,
  onSelectPosition,
  onSelectPositions,
}: SelectPositionType): JSX.Element {
  const mapPosition = getJSONItem<{
    y: number;
    x: number;
    zoom: number;
  }>('mapPosition');

  const [x, setX] = useState(mapPosition?.x || 8000);
  const [y, setY] = useState(mapPosition?.y || 8000);
  const [z, setZ] = useState(mapPosition?.zoom || 8000);
  const [positions, setPositions] = useState<[number, number][]>([]);
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });

  useGeoman({
    details,
    leafletMap,
    iconUrl: filter.iconUrl,
    filter,
    x,
    y,
    onMove: (x: number, y: number) => {
      setX(x);
      setY(y);
    },
    onDraw: (positions) => {
      setPositions(positions);
    },
  });
  useLayerGroups({
    leafletMap,
  });

  function handleSave() {
    if (!filter.isArea) {
      onSelectPosition([x, y, z]);
    } else {
      onSelectPositions(positions);
    }
  }

  return (
    <div className={styles.container}>
      <aside className={styles.selection}>
        {!filter.isArea && (
          <>
            <label>
              Position X
              <input
                className={styles.input}
                type="number"
                placeholder="e.g. 9015.32"
                min={0}
                max={14336}
                step={0.01}
                value={x}
                onChange={(event) => setX(+(+event.target.value).toFixed(2))}
                required
              />
            </label>
            <label>
              Position Y
              <input
                className={styles.input}
                type="number"
                placeholder="e.g. 5015.12"
                min={0}
                max={14336}
                step={0.01}
                value={y}
                onChange={(event) => setY(+(+event.target.value).toFixed(2))}
                required
              />
            </label>
            <label>
              Position Z
              <input
                className={styles.input}
                type="number"
                placeholder="e.g. 120.82 (optional)"
                min={0}
                max={2000}
                step={0.01}
                value={z}
                onChange={(event) => setZ(+(+event.target.value).toFixed(2))}
              />
            </label>
          </>
        )}
      </aside>
      <div className={styles.map} ref={elementRef} />
      <button className={styles.save} onClick={handleSave}>
        Save Position
      </button>
    </div>
  );
}

export default SelectPosition;
