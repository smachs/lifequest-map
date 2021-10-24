import Checkbox from './Checkbox';
import type { MapFiltersCategory } from './mapFilters';
import styles from './MarkerSection.module.css';
import { searchMapFilter } from './searchMapFilter';

type MarkerSectionProps = {
  mapFilterCategory: MapFiltersCategory;
  filters: string[];
  search: string;
  onToggle: (filterTypes: string[], checked: boolean) => void;
};

function MarkerSection({
  mapFilterCategory,
  filters,
  search,
  onToggle,
}: MarkerSectionProps): JSX.Element {
  const categories = search
    ? mapFilterCategory.filters.filter(searchMapFilter(search))
    : mapFilterCategory.filters;
  if (categories.length === 0) {
    return <> </>;
  }

  return (
    <section key={mapFilterCategory.value} className={styles.container}>
      <Checkbox
        onChange={(checked) =>
          onToggle(
            categories.map((filter) => filter.type),
            checked
          )
        }
        checked={filters.some((filter) =>
          categories.some((categoryFilter) => categoryFilter.type === filter)
        )}
        title={mapFilterCategory.title}
        className={styles.category}
      />
      <div className={styles.items}>
        {categories.map((filter) => (
          <Checkbox
            key={filter.type}
            onChange={(checked) => onToggle([filter.type], checked)}
            checked={filters.includes(filter.type)}
            imgSrc={filter.iconUrl}
            title={filter.title}
            countType={filter.type}
          />
        ))}
      </div>
    </section>
  );
}

export default MarkerSection;
