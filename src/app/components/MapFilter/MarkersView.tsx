import styles from './MarkersView.module.css';
import { mapFilters, mapFiltersCategories } from './mapFilters';
import MarkerSection from './MarkerSection';
import Checkbox from './Checkbox';
import { useFilters } from '../../contexts/FiltersContext';

function MarkersView(): JSX.Element {
  const [filters, setFilters] = useFilters();

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
    setFilters(newFilters);
  }

  return (
    <>
      <div className={styles.actions}>
        <button
          className={styles.action}
          onClick={() => {
            setFilters(mapFilters.map((filter) => filter.type));
          }}
        >
          Show all
        </button>
        <button
          className={styles.action}
          onClick={() => {
            setFilters([]);
          }}
        >
          Hide all
        </button>
        <Checkbox
          className={styles.action}
          onChange={(checked) => handleToggle(['hidden'], checked)}
          checked={filters.includes('hidden')}
          title="Show Hidden"
        />
      </div>
      <div className={styles.list}>
        {mapFiltersCategories.map((mapFilterCategory) => (
          <MarkerSection
            key={mapFilterCategory.value}
            mapFilterCategory={mapFilterCategory}
            filters={filters}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </>
  );
}

export default MarkersView;
