import { useEffect, useMemo, useState } from 'react';
import { useFilters } from '../../contexts/FiltersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { useModal } from '../../contexts/ModalContext';
import { usePosition } from '../../contexts/PositionContext';
import { useUser } from '../../contexts/UserContext';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { calcDistance } from '../../utils/positions';
import { usePersistentState } from '../../utils/storage';
import ActionButton from '../ActionControl/ActionButton';
import { deleteMarkerRoute, getMarkerRoutes } from './api';
import MarkerRoute from './MarkerRoute';
import styles from './MarkerRoutes.module.css';
import SelectRoute from './SelectRoute';

export type MarkerRouteItem = {
  _id: string;
  name: string;
  username: string;
  isPublic: boolean;
  positions: [number, number][];
  markersByType: {
    [type: string]: number;
  };
  createdAt: string;
};

type SortBy = 'match' | 'distance' | 'date' | 'name' | 'username';
type Filter = 'all' | 'private' | 'public';

function handleFilter(filter: Filter) {
  if (filter === 'private') {
    return (item: MarkerRouteItem) => !item.isPublic;
  }
  if (filter === 'public') {
    return (item: MarkerRouteItem) => item.isPublic;
  }
  return (item: MarkerRouteItem) => item;
}

function handleSort(
  sortBy: SortBy,
  filters: string[],
  position: [number, number] | null
) {
  if (sortBy === 'date') {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      b.createdAt.localeCompare(a.createdAt);
  }
  if (sortBy === 'distance' && position) {
    return (a: MarkerRouteItem, b: MarkerRouteItem) =>
      calcDistance(position, b.positions[0]) -
      calcDistance(position, a.positions[0]);
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
  const user = useUser();
  const [sortBy, setSortBy] = usePersistentState<SortBy>(
    'markerRoutesSort',
    'match'
  );
  const [filter, setFilter] = usePersistentState<Filter>(
    'markerRoutesFilter',
    'all'
  );
  const [filters] = useFilters();
  const { position } = usePosition();

  const reload = async () => {
    try {
      const newMarkerRoutes = await notify(getMarkerRoutes(user?._id));
      setAllMarkerRoutes(newMarkerRoutes);
    } catch (error) {
      writeError(error);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleRemove(markerRouteId: string): Promise<void> {
    if (!user) {
      return;
    }
    try {
      await notify(deleteMarkerRoute(markerRouteId, user._id), {
        success: 'Route deleted 👌',
      });
      reload();
    } catch (error) {
      writeError(error);
    }
  }

  function isRemoveable(markerRoute: MarkerRouteItem): boolean {
    return Boolean(
      user && (user.isModerator || user.username === markerRoute.username)
    );
  }

  async function handleAdd(markerRoute: MarkerRouteItem) {
    await reload();
    toggleMarkerRoute(markerRoute);
  }

  const sortedMarkerRoutes = useMemo(
    () =>
      allMarkerRoutes
        .filter(handleFilter(filter))
        .sort(handleSort(sortBy, filters, position)),
    [sortBy, allMarkerRoutes, filters, position, filter]
  );

  return (
    <section className={styles.container}>
      <div className={styles.actions}>
        <ActionButton
          disabled={!user}
          onClick={() => {
            addModal({
              title: 'New Route',
              children: <SelectRoute onAdd={handleAdd} />,
            });
          }}
        >
          {user ? 'Add route' : 'Login to add route'}
        </ActionButton>
        <ActionButton onClick={clearMarkerRoutes}>Hide all</ActionButton>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="match">By match</option>
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
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div className={styles.items}>
        {sortedMarkerRoutes.map((markerRoute) => (
          <MarkerRoute
            key={markerRoute.name}
            markerRoute={markerRoute}
            selected={markerRoutes.some(
              (selectedMarkerRoute) =>
                selectedMarkerRoute.name == markerRoute.name
            )}
            onClick={() => toggleMarkerRoute(markerRoute)}
            onRemove={
              isRemoveable(markerRoute) && (() => handleRemove(markerRoute._id))
            }
          />
        ))}
      </div>
    </section>
  );
}

export default MarkerRoutes;
