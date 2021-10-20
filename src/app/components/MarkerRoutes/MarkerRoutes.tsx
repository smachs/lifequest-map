import { useEffect, useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { useModal } from '../../contexts/ModalContext';
import { fetchJSON } from '../../utils/api';
import ActionButton from '../ActionControl/ActionButton';
import MarkerRoute from './MarkerRoute';
import styles from './MarkerRoutes.module.css';
import SelectRoute from './SelectRoute';

export type MarkerRouteItem = {
  name: string;
  positions: [number, number][];
  markersByType: {
    [type: string]: number;
  };
};

function MarkerRoutes(): JSX.Element {
  const { addModal } = useModal();
  const { markerRoutes, toggleMarkerRoute } = useMarkers();
  const [allMarkerRoutes, setAllMarkerRoutes] = useState<MarkerRouteItem[]>([]);

  const reload = () => {
    fetchJSON<MarkerRouteItem[]>('/api/marker-routes').then(setAllMarkerRoutes);
  };
  useEffect(() => {
    reload();
  }, []);

  return (
    <section>
      <div className={styles.actions}>
        <ActionButton
          onClick={() => {
            addModal({
              title: 'New Route',
              children: <SelectRoute onAdd={reload} />,
            });
          }}
        >
          New route
        </ActionButton>
      </div>
      <div>
        {allMarkerRoutes.map((markerRoute) => (
          <MarkerRoute
            key={markerRoute.name}
            markerRoute={markerRoute}
            selected={markerRoutes.some(
              (selectedMarkerRoute) =>
                selectedMarkerRoute.name == markerRoute.name
            )}
            onClick={() => toggleMarkerRoute(markerRoute)}
          />
        ))}
      </div>
    </section>
  );
}

export default MarkerRoutes;
