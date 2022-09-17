import AddResources from '../AddResources/AddResources';
import type { MarkerDTO } from '../AddResources/api';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import SelectRoute from '../MarkerRoutes/SelectRoute';
import styles from './UpsertArea.module.css';

type UpsertAreaProps = {
  markerRoute?: MarkerRouteItem | true;
  marker?: MarkerDTO | true;
  onRouteClose: () => void;
  onMarkerClose: () => void;
};

function UpsertArea({
  markerRoute,
  marker,
  onRouteClose,
  onMarkerClose,
}: UpsertAreaProps) {
  return (
    <aside className={styles.fixed}>
      {markerRoute && (
        <SelectRoute
          markerRoute={markerRoute === true ? undefined : markerRoute}
          onClose={onRouteClose}
        />
      )}
      {marker && (
        <AddResources
          marker={marker === true ? undefined : marker}
          onClose={onMarkerClose}
        />
      )}
    </aside>
  );
}

export default UpsertArea;
