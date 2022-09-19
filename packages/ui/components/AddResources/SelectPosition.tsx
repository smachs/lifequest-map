import useGeoman from './useGeoman';
import styles from './SelectPosition.module.css';
import generalStyles from './AddResources.module.css';
import type { FilterItem } from 'static';
import type { Details } from './AddResources';
import { latestLeafletMap } from '../WorldMap/useWorldMap';

type SelectPositionType = {
  details: Details | null;
  filter: FilterItem | null;
  location: [number, number, number];
  onSelectLocation: (position: [number, number, number]) => void;
};
function SelectPosition({
  details,
  filter,
  onSelectLocation,
  location,
}: SelectPositionType): JSX.Element {
  useGeoman({
    details,
    leafletMap: latestLeafletMap!,
    iconUrl: filter?.iconUrl,
    filter,
    x: location[0],
    y: location[1],
    onMove: (x: number, y: number) => {
      onSelectLocation([x, y, location[2]]);
    },
  });

  return (
    <label>
      <span className={generalStyles.key}>Position</span> [
      <input
        className={styles.input}
        type="number"
        placeholder="e.g. 9015.32"
        min={0}
        max={14336}
        step={0.01}
        value={location[0]}
        onChange={(event) =>
          onSelectLocation([
            +(+event.target.value).toFixed(2),
            location[1],
            location[2],
          ])
        }
        required
      />
      ,{' '}
      <input
        className={styles.input}
        type="number"
        placeholder="e.g. 5015.12"
        min={0}
        max={14336}
        step={0.01}
        value={location[1]}
        onChange={(event) =>
          onSelectLocation([
            location[0],
            +(+event.target.value).toFixed(2),
            location[2],
          ])
        }
        required
      />
      ]
    </label>
  );
}

export default SelectPosition;
