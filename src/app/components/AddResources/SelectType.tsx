import { useState } from 'react';
import type { FilterItem } from '../MapFilter/mapFilters';
import { mapFilters } from '../MapFilter/mapFilters';
import styles from './SelectType.module.css';
import generalStyles from './AddResources.module.css';
import CloseIcon from '../icons/CloseIcon';
import { usePersistentState } from '../../utils/storage';
import SearchInput from '../SearchInput/SearchInput';

type SelectTypeType = {
  onSelect: (filter: FilterItem | null) => void;
  filter: FilterItem | null;
};
function SelectType({ onSelect, filter }: SelectTypeType): JSX.Element {
  const [search, setSearch] = useState('');
  const regExp = new RegExp(search, 'ig');
  const filters = mapFilters.filter((filter) => filter.title.match(regExp));
  const [isFocus, setIsFocus] = useState(false);
  const [lastSearch, setLastSearch] = usePersistentState<FilterItem[]>(
    'lastTypeSearch',
    []
  );

  if (filter) {
    return (
      <label className={styles.label}>
        <span className={generalStyles.key}>Type</span>
        <div className={styles.filter} onClick={() => onSelect(null)}>
          <img src={filter.iconUrl} alt="" />
          {filter.title} <CloseIcon />
        </div>
      </label>
    );
  }

  const handleClick = (filter: FilterItem) => () => {
    setSearch('');
    onSelect(filter);
    setLastSearch((lastSearch) =>
      [filter, ...lastSearch.filter((last) => last.type !== filter.type)].slice(
        0,
        2
      )
    );
  };

  const renderButton = (filter: FilterItem) => (
    <button
      key={filter.type}
      onMouseDown={handleClick(filter)}
      className={styles.filter}
    >
      <img src={filter.iconUrl} alt="" />
      {filter.title}
    </button>
  );

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <span className={generalStyles.key}>Type</span>
        <SearchInput
          placeholder="Search marker type..."
          value={search}
          onChange={setSearch}
          autoFocus
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
        />
      </label>
      {isFocus && (
        <div className={styles.suggestions}>
          {!search && lastSearch.map(renderButton)}
          {!search && lastSearch.length > 0 && <hr />}
          {filters.map(renderButton)}
          {filters.length === 0 && 'No results'}
        </div>
      )}
    </div>
  );
}

export default SelectType;
