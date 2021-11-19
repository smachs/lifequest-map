import styles from './MarkersView.module.css';
import { mapFilters, mapFiltersCategories } from './mapFilters';
import MarkerSection from './MarkerSection';
import { useFilters } from '../../contexts/FiltersContext';
import ActionButton from '../ActionControl/ActionButton';
import ActionCheckbox from '../ActionControl/ActionCheckbox';
import { searchMapFilter } from './searchMapFilter';
import { usePersistentState } from '../../utils/storage';
import { useAccount } from '../../contexts/UserContext';
import SearchInput from '../SearchInput/SearchInput';

type MarkersViewProps = {
  adding: boolean;
  onAdd: () => void;
};
function MarkersView({ adding, onAdd }: MarkersViewProps): JSX.Element {
  const [filters, setFilters] = useFilters();
  const [search, setSearch] = usePersistentState('searchMarkerTypes', '');
  const { account } = useAccount();

  function handleToggle(filterTypes: string[], checked: boolean) {
    const newFilters = [...filters];
    if (checked) {
      newFilters.push(...filterTypes);
    } else {
      filterTypes.forEach((filterType) => {
        const index = newFilters.indexOf(filterType);
        if (index !== -1) {
          newFilters.splice(newFilters.indexOf(filterType), 1);
        }
      });
    }
    const uniqueFilters = Array.from(new Set(newFilters));
    setFilters(uniqueFilters);
  }

  return (
    <section className={styles.container}>
      <div className={styles.actions}>
        <ActionButton disabled={adding || !account} onClick={onAdd}>
          {account ? 'Add resource' : 'Login to add route'}
        </ActionButton>
        <ActionCheckbox
          className={styles.action}
          onChange={(checked) => handleToggle(['hidden'], checked)}
          checked={filters.includes('hidden')}
          title="Toggle Hidden"
        />
      </div>
      <div className={styles.actions}>
        <SearchInput
          placeholder="Search marker types..."
          value={search}
          onChange={setSearch}
        />
        <ActionButton
          onClick={() => {
            handleToggle(
              mapFilters
                .filter(searchMapFilter(search))
                .map((filter) => filter.type),
              true
            );
          }}
        >
          Show all
        </ActionButton>
        <ActionButton
          onClick={() => {
            handleToggle(
              mapFilters
                .filter(searchMapFilter(search))
                .map((filter) => filter.type),
              false
            );
          }}
        >
          Hide all
        </ActionButton>
      </div>
      <div className={styles.list}>
        {mapFiltersCategories.map((mapFilterCategory) => (
          <MarkerSection
            key={mapFilterCategory.value}
            mapFilterCategory={mapFilterCategory}
            filters={filters}
            onToggle={handleToggle}
            search={search}
          />
        ))}
      </div>
    </section>
  );
}

export default MarkersView;
