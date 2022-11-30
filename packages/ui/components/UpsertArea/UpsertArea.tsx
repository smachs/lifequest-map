import { Dialog } from '@mantine/core';
import AddResources from '../AddResources/AddResources';
import type { MarkerDTO } from '../AddResources/api';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import SelectRoute from '../MarkerRoutes/SelectRoute';

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
    <Dialog
      opened={Boolean(markerRoute || marker)}
      position={{ top: 58, right: 7 }}
    >
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
    </Dialog>
  );
}

export default UpsertArea;
