import styles from './MarkerTypes.module.css';
import { mapFilters } from '../MapFilter/mapFilters';
import { useFilters } from '../../contexts/FiltersContext';
import { classNames } from '../../utils/styles';

type MarkerTypesProps = {
  markersByType: {
    [type: string]: number;
  };
};

function MarkerTypes({ markersByType }: MarkerTypesProps): JSX.Element {
  const [filters] = useFilters();

  return (
    <section className={styles.container}>
      {Object.keys(markersByType).length === 0 && 'No markers selected'}
      {Object.keys(markersByType).map((markerType) => {
        const mapFilter = mapFilters.find(
          (mapFilter) => mapFilter.type === markerType
        );
        if (!mapFilter) {
          return <></>;
        }
        return (
          <div
            key={markerType}
            className={classNames(
              styles.marker,
              !filters.includes(markerType) && styles.unchecked
            )}
            data-tooltip={mapFilter.title}
          >
            <img
              src={
                mapFilters.find((mapFilter) => mapFilter.type === markerType)
                  ?.iconUrl
              }
              alt={markerType}
            />
            <span>{markersByType[markerType]}x</span>
          </div>
        );
      })}
    </section>
  );
}

export default MarkerTypes;
