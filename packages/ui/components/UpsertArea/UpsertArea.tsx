import { Dialog, Skeleton } from '@mantine/core';
import { lazy, Suspense } from 'react';
import type { MarkerDTO } from '../AddResources/api';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
const AddResources = lazy(() => import('../AddResources/AddResources'));
const SelectRoute = lazy(() => import('../MarkerRoutes/SelectRoute'));
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

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
      withCloseButton
      onClose={() => {
        if (markerRoute) {
          onRouteClose();
        }
        if (marker) {
          onMarkerClose();
        }
      }}
    >
      {markerRoute && (
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <SelectRoute
              markerRoute={markerRoute === true ? undefined : markerRoute}
              onClose={onRouteClose}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {marker && (
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <AddResources
              marker={marker === true ? undefined : marker}
              onClose={onMarkerClose}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </Dialog>
  );
}

export default UpsertArea;
