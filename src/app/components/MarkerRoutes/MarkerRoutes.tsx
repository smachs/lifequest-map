import { useEffect, useMemo, useState } from 'react';
import { useFilters } from '../../contexts/FiltersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { useModal } from '../../contexts/ModalContext';
import type { Position } from '../../contexts/PositionContext';
import { usePosition } from '../../contexts/PositionContext';
import type { AccountDTO } from '../../contexts/UserContext';
import { useAccount } from '../../contexts/UserContext';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { calcDistance } from '../../utils/positions';
import { usePersistentState } from '../../utils/storage';
import ActionButton from '../ActionControl/ActionButton';
import SearchIcon from '../icons/SearchIcon';
import { mapFilters } from '../MapFilter/mapFilters';
import {
  deleteMarkerRoute,
  getMarkerRoutes,
  patchFavoriteMarkerRoute,
  patchMarkerRoute,
} from './api';
import MarkerRoute from './MarkerRoute';
import styles from './MarkerRoutes.module.css';
import SelectRoute from './SelectRoute';

export type MarkerRouteItem = {
  _id: string;
  name: string;
  userId: string;
  username: string;
  isPublic: boolean;
  positions: [number, number][];
  markersByType: {
    [type: string]: number;
  };
  favorites?: number;
  createdAt: string;
};

type SortBy = 'match' | 'favorites' | 'distance' | 'date' | 'name' | 'username';
type Filter = 'all' | 'private' | 'public' | 'favorites';

function handleFilter(
  filter: Filter,
  search: string,
  account: AccountDTO | null
) {
  const regExp = new RegExp(search, 'i');
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
  if (filter === 'private') {
    return (item: MarkerRouteItem) =>
      (!item.isPublic || item.userId === account?.steamId) &&
      filterBySearch(item);
  }
  if (filter === 'public') {
    return (item: MarkerRouteItem) => item.isPublic && filterBySearch(item);
  }
  return (item: MarkerRouteItem) => filterBySearch(item);
}

function handleSort(
  sortBy: SortBy,
  filters: string[],
  position: Position | null
) {
  if (sortBy === 'favorites') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      (b.favorites || 0) - (a.favorites || 0);
  }
  if (sortBy === 'date') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      b.createdAt.localeCompare(a.createdAt);
  }
  if (sortBy === 'distance' && position) {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      calcDistance(position.location, b.positions[0]) -
      calcDistance(position.location, a.positions[0]);
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
      typesA.length / typesA.filter((type) => filters.includes(type)).length;
    const matchB =
      typesB.length / typesB.filter((type) => filters.includes(type)).length;
    return matchA - matchB;
  };
}

function MarkerRoutes(): JSX.Element {
  const { addModal } = useModal();
  const { markerRoutes, clearMarkerRoutes, toggleMarkerRoute } = useMarkers();
  const [allMarkerRoutes, setAllMarkerRoutes] = useState<MarkerRouteItem[]>([]);
  const { account, refreshAccount } = useAccount();
  const [sortBy, setSortBy] = usePersistentState<SortBy>(
    'markerRoutesSort',
    'match'
  );
  const [filter, setFilter] = usePersistentState<Filter>(
    'markerRoutesFilter',
    'all'
  );
  const [search, setSearch] = usePersistentState('searchRoutes', '');
  const [filters] = useFilters();
  const { position } = usePosition();

  const reload = async () => {
    try {
      const newMarkerRoutes = await notify(getMarkerRoutes());
      setAllMarkerRoutes(newMarkerRoutes);
    } catch (error) {
      writeError(error);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleRemove(markerRouteId: string): Promise<void> {
    if (!account) {
      return;
    }
    try {
      await notify(deleteMarkerRoute(markerRouteId), {
        success: 'Route deleted 👌',
      });
      reload();
    } catch (error) {
      writeError(error);
    }
  }

  async function handleTogglePublic(
    markerRouteId: string,
    isPublic: boolean
  ): Promise<void> {
    if (!account) {
      return;
    }
    try {
      await notify(patchMarkerRoute(markerRouteId, { isPublic: !isPublic }), {
        success: 'Route visibility changed 👌',
      });
      reload();
    } catch (error) {
      writeError(error);
    }
  }

  async function handleFavorite(markerRouteId: string): Promise<void> {
    if (!account) {
      return;
    }
    const isFavorite = account.favoriteRouteIds?.some(
      (routeId) => markerRouteId === routeId
    );
    try {
      await notify(patchFavoriteMarkerRoute(markerRouteId, !isFavorite), {
        success: 'Favored route changed 👌',
      });
      refreshAccount();
      reload();
    } catch (error) {
      writeError(error);
    }
  }

  function isEditable(markerRoute: MarkerRouteItem): boolean {
    return Boolean(
      account && (account.isModerator || account.steamId === markerRoute.userId)
    );
  }

  async function handleAdd(markerRoute: MarkerRouteItem) {
    await reload();
    toggleMarkerRoute(markerRoute);
  }

  const sortedMarkerRoutes = useMemo(
    () =>
      allMarkerRoutes
        .filter(handleFilter(filter, search, account))
        .sort(handleSort(sortBy, filters, position)),
    [sortBy, allMarkerRoutes, filters, position, filter, search]
  );

  return (
    <section className={styles.container}>
      <div className={styles.actions}>
        <ActionButton
          disabled={!account}
          onClick={() => {
            addModal({
              title: 'New Route',
              children: <SelectRoute onAdd={handleAdd} />,
            });
          }}
        >
          {account ? 'Add route' : 'Login to add route'}
        </ActionButton>
        <ActionButton onClick={clearMarkerRoutes}>Hide all</ActionButton>
      </div>
      <div className={styles.actions}>
        <label className={styles.search}>
          <SearchIcon />
          <input
            placeholder="Marker or title..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="match">By match</option>
          <option value="favorites">By favorites</option>
          <option value="distance">By distance</option>
          <option value="date">By date</option>
          <option value="name">By name</option>
          <option value="username">By username</option>
        </select>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
        >
          <option value="all">All</option>
          <option value="favorites">Favorites</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div className={styles.items}>
        {sortedMarkerRoutes.map((markerRoute) => (
          <MarkerRoute
            key={`${markerRoute.name}-${markerRoute.username}`}
            markerRoute={markerRoute}
            selected={markerRoutes.some(
              (selectedMarkerRoute) =>
                selectedMarkerRoute.name == markerRoute.name
            )}
            editable={isEditable(markerRoute)}
            isPublic={markerRoute.isPublic}
            onClick={() => toggleMarkerRoute(markerRoute)}
            onPublic={() =>
              handleTogglePublic(markerRoute._id, markerRoute.isPublic)
            }
            onRemove={() => handleRemove(markerRoute._id)}
            isFavorite={Boolean(
              account?.favoriteRouteIds?.some(
                (routeId) => markerRoute._id === routeId
              )
            )}
            onFavorite={() => handleFavorite(markerRoute._id)}
          />
        ))}
      </div>
    </section>
  );
}

export default MarkerRoutes;
