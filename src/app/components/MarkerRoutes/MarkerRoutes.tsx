import { useEffect, useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { useModal } from '../../contexts/ModalContext';
import { useUser } from '../../contexts/UserContext';
import { fetchJSON } from '../../utils/api';
import { writeError } from '../../utils/logs';
import ActionButton from '../ActionControl/ActionButton';
import MarkerRoute from './MarkerRoute';
import styles from './MarkerRoutes.module.css';
import SelectRoute from './SelectRoute';

export type MarkerRouteItem = {
  _id: string;
  name: string;
  username: string;
  positions: [number, number][];
  markersByType: {
    [type: string]: number;
  };
  createdAt: Date;
};

function MarkerRoutes(): JSX.Element {
  const { addModal } = useModal();
  const { markerRoutes, clearMarkerRoutes, toggleMarkerRoute } = useMarkers();
  const [allMarkerRoutes, setAllMarkerRoutes] = useState<MarkerRouteItem[]>([]);
  const user = useUser();

  const reload = async () => {
    try {
      const newMarkerRoutes = await fetchJSON<MarkerRouteItem[]>(
        '/api/marker-routes'
      );
      setAllMarkerRoutes(newMarkerRoutes);
    } catch (error) {
      writeError(error);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  async function handleRemove(markerRouteId: string): Promise<void> {
    try {
      await fetchJSON(`/api/marker-routes/${markerRouteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?._id,
        }),
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
      </div>
      <div className={styles.items}>
        {allMarkerRoutes.map((markerRoute) => (
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
