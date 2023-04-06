import { Avatar, Badge, Text, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
import type { FilterItem } from 'static';
import { mapFilters } from 'static';
import { useFiltersStore } from '../../utils/filtersStore';
import { classNames } from '../../utils/styles';
import styles from './MarkerTypes.module.css';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

type MarkerTypesProps = {
  markersByType: {
    [type: string]: number;
  };
};

function MarkerTypes({ markersByType }: MarkerTypesProps): JSX.Element {
  const { filters } = useFiltersStore();

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
    <section>
      {markerMapFilters.length === 0 && (
        <Text size="xs" color="dimmed">
          No markers
        </Text>
      )}
      {markerMapFilters.map((markerMapFilter) => {
        return (
          <Tooltip key={markerMapFilter.type} label={markerMapFilter.title}>
            <Badge
              leftSection={
                <Avatar
                  size={24}
                  src={`${VITE_API_ENDPOINT}/assets${markerMapFilter.iconUrl}`}
                  alt={markerMapFilter.type}
                />
              }
              className={classNames(
                !filters.some((filter) =>
                  filter.startsWith(markerMapFilter.type)
                ) && styles.unchecked
              )}
            >
              {markersByType[markerMapFilter.type]}
            </Badge>
          </Tooltip>
        );
      })}
    </section>
  );
}

export default MarkerTypes;
