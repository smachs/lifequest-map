import type { FormEvent } from 'react';
import { useState } from 'react';
import { classNames } from '../../utils/styles';
import LocationIcon from '../icons/LocationIcon';
import SearchIcon from '../icons/SearchIcon';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import styles from './MapSearch.module.css';

type MapSearchType = {
  className?: string;
};
function MapSearch({ className }: MapSearchType): JSX.Element {
  const [value, setValue] = useState('');

  const positions = value
    .split(',')
    .map((item) => +item.replace(/[^0-9.]/g, ''))
    .slice(0, 2);
  const isValid = positions.length === 2;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (latestLeafletMap && isValid) {
      latestLeafletMap.panTo([positions[1], positions[0]]);
    }
  }

  return (
    <div className={styles.container}>
      <button className={classNames(styles.location, className)}>
        <LocationIcon />
      </button>
      <form className={styles.search} onSubmit={handleSubmit}>
        <input
          placeholder="Enter coordinates [x, y]"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className={styles.button} disabled={!isValid}>
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}

export default MapSearch;
