import type { FilterItem, MapFiltersCategory } from 'static';
import Checkbox from './Checkbox';
import FilterSelection from './FilterSelection';
import styles from './MarkerSection.module.css';

type MarkerSectionProps = {
  mapFilterCategory: MapFiltersCategory;
  filters: string[];
  searchRegExp: RegExp | null;
  onToggle: (filterTypes: string[], checked: boolean) => void;
};

function MarkerSection({
  mapFilterCategory,
  filters,
  searchRegExp,
  onToggle,
}: MarkerSectionProps): JSX.Element {
  let categories: FilterItem[];
  if (!searchRegExp || mapFilterCategory.title.match(searchRegExp)) {
    categories = mapFilterCategory.filters;
  } else {
    categories = mapFilterCategory.filters.filter((mapFilter) =>
      Boolean(mapFilter.title.match(searchRegExp))
    );
  }

  if (categories.length === 0) {
    return <></>;
  }

  return (
    <section className={styles.container}>
      {!location.search.includes('test=1') && (
        <Checkbox
          onChange={(checked) =>
            onToggle(
              categories
                .map((filter) => {
                  if (filter.category === 'chests') {
                    const tierTypes = Array(filter.maxTier || 5)
                      .fill(null)
                      .map((_, index) => `${filter.type}-${index + 1}`);
                    return tierTypes;
                  }
                  if (filter.sizes) {
                    return filter.sizes.map((size) => `${filter.type}-${size}`);
                  }
                  return filter.type;
                })
                .flat(),
              checked
            )
          }
          checked={filters.some((filter) =>
            categories.some(
              (categoryFilter) =>
                filter.replace(/-.+/, '') === categoryFilter.type
            )
          )}
          title={mapFilterCategory.title}
          className={styles.category}
        />
      )}
      {!location.search.includes('test=2') && (
        <div className={styles.items}>
          {categories.map((filter) => (
            <FilterSelection
              key={filter.type}
              filter={filter}
              filters={filters}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default MarkerSection;
