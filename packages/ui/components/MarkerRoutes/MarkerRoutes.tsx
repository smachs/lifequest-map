import {
  Box,
  Button,
  Group,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  findMapDetails,
  mapFilters,
  mapIsAeternumMap,
  regionNames,
} from 'static';
import { useMarkers } from '../../contexts/MarkersContext';
import { useFiltersStore } from '../../utils/filtersStore';
import { escapeRegExp } from '../../utils/regExp';
import { useMap } from '../../utils/routes';
import { usePersistentState } from '../../utils/storage';
import type { AccountDTO } from '../../utils/userStore';
import { useUserStore } from '../../utils/userStore';
import { useUpsertStore } from '../UpsertArea/upsertStore';
import MarkerRoute from './MarkerRoute';
import { getMarkerRoutes } from './api';

export type MarkerRouteItem = {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  username: string;
  isPublic: boolean;
  map?: string;
  positions: [number, number][];
  texts?: {
    position: number[];
    text: string;
  }[];
  regions: string[];
  markersByType: {
    [type: string]: number;
  };
  favorites?: number;
  forks?: number;
  comments?: number;
  issues?: number;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount?: number;
};

type SortBy =
  | 'match'
  | 'favorites'
  | 'usage'
  | 'lastUsage'
  | 'date'
  | 'name'
  | 'username';
type Filter = 'all' | 'myRoutes' | 'favorites' | string;

function handleFilter(
  filter: Filter,
  search: string,
  account: AccountDTO | null
) {
  const regExp = new RegExp(escapeRegExp(search), 'i');
  const filterBySearch = (item: MarkerRouteItem) => {
    if (search === '') {
      return true;
    }
    const matchedMarkersType = Object.keys(item.markersByType).some((type) => {
      const mapFilter = mapFilters.find((filter) => filter.type === type);
      if (!mapFilter) {
        return false;
      }
      return mapFilter.title.match(regExp);
    });
    return matchedMarkersType || item.name.match(regExp);
  };
  if (filter === 'favorites') {
    return (item: MarkerRouteItem) =>
      account?.favoriteRouteIds?.includes(item._id) && filterBySearch(item);
  }
  if (filter === 'myRoutes') {
    return (item: MarkerRouteItem) =>
      item.userId === account?.steamId && filterBySearch(item);
  }
  if (regionNames.includes(filter)) {
    return (item: MarkerRouteItem) =>
      item.regions?.includes(filter) && filterBySearch(item);
  }
  return (item: MarkerRouteItem) => filterBySearch(item);
}

function handleSort(sortBy: SortBy, filters: string[]) {
  if (sortBy === 'favorites') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      (b.favorites || 0) - (a.favorites || 0);
  }
  if (sortBy === 'usage') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      (b.usageCount ?? 0) - (a.usageCount ?? 0);
  }
  if (sortBy === 'lastUsage') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      (b.lastUsedAt ?? '').localeCompare(a.lastUsedAt ?? '');
  }
  if (sortBy === 'date') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      b.updatedAt?.localeCompare(a.updatedAt);
  }
  if (sortBy === 'name') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      a.name.localeCompare(b.name);
  }
  if (sortBy === 'username') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      a.username.localeCompare(b.username);
  }
  return (a: MarkerRouteItem, b: MarkerRouteItem) => {
    const typesA = Object.keys(a.markersByType);
    const typesB = Object.keys(b.markersByType);
    const matchA =
      typesA.length /
      typesA.filter((type) => filters.some((filter) => filter.startsWith(type)))
        .length;
    const matchB =
      typesB.length /
      typesB.filter((type) => filters.some((filter) => filter.startsWith(type)))
        .length;
    return matchA - matchB;
  };
}

function MarkerRoutes(): JSX.Element {
  const { data: allMarkerRoutes, isLoading } = useQuery(
    ['routes'],
    getMarkerRoutes
  );
  const { markerRoutes, setMarkerRoutes, toggleMarkerRoute } = useMarkers();
  const account = useUserStore((state) => state.account);
  const upsertStore = useUpsertStore();
  const [sortBy, setSortBy] = usePersistentState<SortBy>(
    'markerRoutesSort',
    'match'
  );
  const [filter, setFilter] = usePersistentState<Filter>(
    'markerRoutesFilter',
    'all'
  );
  const [search, setSearch] = usePersistentState('searchRoutes', '');
  const { filters } = useFiltersStore();

  const [limit, setLimit] = useState(10);
  const map = useMap();

  useEffect(() => {
    setLimit(10);
  }, [sortBy, filter, search]);

  useEffect(() => {
    if (!allMarkerRoutes) {
      return;
    }
    const selectedMarkerRoutes: MarkerRouteItem[] = [];
    let isChanged = false;
    markerRoutes.forEach((markerRoute) => {
      const newMarkerRoute = allMarkerRoutes?.find(
        (targetMarkerRoute) =>
          targetMarkerRoute._id === markerRoute._id &&
          markerRoute.updatedAt !== targetMarkerRoute.updatedAt
      );
      if (newMarkerRoute) {
        selectedMarkerRoutes.push(newMarkerRoute);
        isChanged = true;
      } else {
        selectedMarkerRoutes.push(markerRoute);
      }
    });
    if (isChanged) {
      setMarkerRoutes(selectedMarkerRoutes);
    }
  }, [allMarkerRoutes]);

  const visibleMarkerRoutes = useMemo(
    () =>
      allMarkerRoutes?.filter((markerRoute) => {
        if (markerRoute.map) {
          if (mapIsAeternumMap(map)) {
            return false;
          }
          if (findMapDetails(map) !== findMapDetails(markerRoute.map)) {
            return false;
          }
        } else if (!mapIsAeternumMap(map)) {
          return false;
        }
        return true;
      }) ?? [],
    [allMarkerRoutes, map]
  );

  const sortedMarkerRoutes = useMemo(
    () =>
      visibleMarkerRoutes
        .filter(handleFilter(filter, search, account))
        .sort(handleSort(sortBy, filters)),
    [sortBy, visibleMarkerRoutes, filters, filter, search]
  );

  return (
    <Stack>
      <Group spacing="xs" grow>
        <Button
          disabled={!account}
          onClick={() => {
            upsertStore.setMarkerRoute(true);
          }}
        >
          {account ? 'Add route' : 'Sign in to add routes'}
        </Button>
        <Button onClick={() => setMarkerRoutes([])}>Hide all</Button>
      </Group>
      <Group spacing="xs" grow>
        <TextInput
          placeholder="Node or title..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          icon={<IconFilter />}
        />
        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value as SortBy)}
          data={[
            { value: 'match', label: 'By match' },
            { value: 'favorites', label: 'By favorites' },
            { value: 'usage', label: 'By total usage' },
            { value: 'lastUsage', label: 'By last usage' },
            { value: 'date', label: 'By date' },
            { value: 'name', label: 'By name' },
            { value: 'username', label: 'By username' },
          ]}
        />
        <Select
          value={filter}
          onChange={(value) => setFilter(value as Filter)}
          data={[
            { value: 'all', label: 'All' },
            { value: 'favorites', label: 'Favorites' },
            { value: 'myRoutes', label: 'My routes' },
            ...regionNames.map((regionName) => ({
              value: regionName,
              label: regionName,
            })),
          ]}
        />
      </Group>
      <Box>
        {isLoading && <Skeleton height={40} />}
        {!isLoading && sortedMarkerRoutes.length === 0 && (
          <Text color="orange">No routes found</Text>
        )}
        {!isLoading &&
          sortedMarkerRoutes
            .slice(0, limit)
            .map((markerRoute) => (
              <MarkerRoute
                key={markerRoute._id}
                isOwner={markerRoute.userId === account?.steamId}
                markerRoute={markerRoute}
                selected={markerRoutes.some(
                  (selectedMarkerRoute) =>
                    selectedMarkerRoute._id == markerRoute._id
                )}
                onSelect={(checked) => toggleMarkerRoute(markerRoute, checked)}
              />
            ))}
        {sortedMarkerRoutes.length > limit && (
          <Button onClick={() => setLimit((limit) => limit + 10)} fullWidth>
            Load more
          </Button>
        )}
      </Box>
    </Stack>
  );
}

export default MarkerRoutes;
