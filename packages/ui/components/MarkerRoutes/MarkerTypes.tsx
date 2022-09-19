import styles from './MarkerTypes.module.css';
import type { FilterItem } from 'static';
import { mapFilters } from 'static';
import { useFilters } from '../../contexts/FiltersContext';
import { classNames } from '../../utils/styles';
import { useMemo } from 'react';

type MarkerTypesProps = {
  markersByType: {
    [type: string]: number;
  };
};

function MarkerTypes({ markersByType }: MarkerTypesProps): JSX.Element {
  const { filters } = useFilters();

  const markerMapFilters: FilterItem[] = useMemo(() => {
    const result: FilterItem[] = [];
    Object.keys(markersByType).forEach((markerType) => {
      const mapFilter = mapFilters.find(
        (mapFilter) => mapFilter.type === markerType
      );
      if (mapFilter) {
        result.push(mapFilter);
      }
    });
    return result;
  }, [markersByType]);

  return (
    <section className={styles.container}>
      {markerMapFilters.length === 0 && 'No markers'}
      {markerMapFilters.map((markerMapFilter) => {
        return (
          <div
            key={markerMapFilter.type}
            className={classNames(
              styles.marker,
              !filters.some((filter) =>
                filter.startsWith(markerMapFilter.type)
              ) && styles.unchecked
            )}
            title={markerMapFilter.title}
          >
            <img src={markerMapFilter.iconUrl} alt={markerMapFilter.type} />
            <span>{markersByType[markerMapFilter.type]}x</span>
          </div>
        );
      })}
    </section>
  );
}

export default MarkerTypes;
