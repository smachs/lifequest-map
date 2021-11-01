import { useState } from 'react';
import useGeoman from './useGeoman';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectPosition.module.css';
import type { FilterItem } from '../MapFilter/mapFilters';
import type { Details } from './AddResources';
import { usePosition } from '../../contexts/PositionContext';
import { getJSONItem } from '../../utils/storage';

type SelectPositionType = {
  details: Details;
  filter: FilterItem;
  onSelectPosition: (position: [number, number, number]) => void;
};
function SelectPosition({
  details,
  filter,
  onSelectPosition,
}: SelectPositionType): JSX.Element {
  const { position } = usePosition();

  const [location, setLocation] = useState<[number, number, number]>(() => {
    if (position) {
      return [...position.location, 0];
    }
    const mapPosition = getJSONItem<
      | {
          y: number;
          x: number;
          zoom: number;
        }
      | undefined
    >('mapPosition', undefined);
    if (mapPosition) {
      return [mapPosition.x, mapPosition.y, 0];
    }
    return [8000, 8000, 0];
  });
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });

  useGeoman({
    details,
    leafletMap,
    iconUrl: filter.iconUrl,
    filter,
    x: location[0],
    y: location[1],
    onMove: (x: number, y: number) => {
      setLocation((location) => [x, y, location[2]]);
    },
  });
  useLayerGroups({
    leafletMap,
    pmIgnore: true,
  });

  function handleSave() {
    onSelectPosition(location);
  }

  return (
    <div className={styles.container}>
      <aside className={styles.selection}>
        <label>
          Position X
          <input
            className={styles.input}
            type="number"
            placeholder="e.g. 9015.32"
            min={0}
            max={14336}
            step={0.01}
            value={location[0]}
            onChange={(event) =>
              setLocation([
                +(+event.target.value).toFixed(2),
                location[1],
                location[2],
              ])
            }
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
            value={location[1]}
            onChange={(event) =>
              setLocation([
                location[0],
                +(+event.target.value).toFixed(2),
                location[2],
              ])
            }
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
            value={location[2]}
            onChange={(event) =>
              setLocation([
                location[0],
                location[1],
                +(+event.target.value).toFixed(2),
              ])
            }
          />
        </label>
      </aside>
      <div className={styles.map} ref={elementRef} />
      <button className={styles.save} onClick={handleSave}>
        Save Position
      </button>
    </div>
  );
}

export default SelectPosition;
