import { useMemo } from 'react';
import type { MapFiltersCategory } from 'static';
import { escapeRegExp } from '../../utils/regExp';
import Checkbox from './Checkbox';
import FilterSelection from './FilterSelection';
import styles from './MarkerSection.module.css';

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
  const categories = useMemo(() => {
    const regExp = new RegExp(escapeRegExp(search), 'i');
    if (!search || mapFilterCategory.title.match(regExp)) {
      return mapFilterCategory.filters;
    }
    return mapFilterCategory.filters.filter((mapFilter) =>
      Boolean(mapFilter.title.match(regExp))
    );
  }, [search]);
  if (categories.length === 0) {
    return <> </>;
  }

  return (
    <section key={mapFilterCategory.value} className={styles.container}>
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
    </section>
  );
}

export default MarkerSection;
