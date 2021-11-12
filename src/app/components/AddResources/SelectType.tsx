import { useState } from 'react';
import type { FilterItem } from '../MapFilter/mapFilters';
import { mapFilters } from '../MapFilter/mapFilters';
import styles from './SelectType.module.css';
import generalStyles from './AddResources.module.css';

type SelectTypeType = {
  onSelect: (filter: FilterItem | null) => void;
  filter: FilterItem | null;
};
function SelectType({ onSelect, filter }: SelectTypeType): JSX.Element {
  const [search, setSearch] = useState('');
  const regExp = new RegExp(search, 'ig');
  const filters = mapFilters.filter((filter) => filter.title.match(regExp));

  const handleClick = (filter: FilterItem) => {
    return () => {
      setSearch('');
      onSelect(filter);
    };
  };

  if (filter) {
    return (
      <label className={styles.label}>
        <span className={generalStyles.key}>Type</span>
        <div className={styles.filter} onClick={() => onSelect(null)}>
          <img src={filter.iconUrl} alt="" />
          {filter.title}
        </div>
      </label>
    );
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <span className={generalStyles.key}>Type</span>
        <input
          placeholder="Search marker type..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          autoFocus
        />
      </label>
      {search && (
        <div className={styles.suggestions}>
          {filters.map((filter) => (
            <button
              key={filter.type}
              onClick={handleClick(filter)}
              className={styles.filter}
            >
              <img src={filter.iconUrl} alt="" />
              {filter.title}
            </button>
          ))}
          {filters.length === 0 && 'No results'}
        </div>
      )}
    </div>
  );
}

export default SelectType;
