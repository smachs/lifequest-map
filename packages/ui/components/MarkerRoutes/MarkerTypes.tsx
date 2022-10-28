import styles from './MarkerTypes.module.css';
import type { FilterItem } from 'static';
import { mapFilters } from 'static';
import { useFilters } from '../../contexts/FiltersContext';
import { classNames } from '../../utils/styles';
import { useMemo } from 'react';
import { Avatar, Badge, Text, Tooltip } from '@mantine/core';

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
                  src={markerMapFilter.iconUrl}
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
