import { Dialog, Skeleton } from '@mantine/core';
import { Suspense, lazy } from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { useUpsertStore } from './upsertStore';
const AddResources = lazy(() => import('../AddResources/AddResources'));
const SelectRoute = lazy(() => import('../MarkerRoutes/SelectRoute'));

function UpsertArea() {
  const { marker, markerRoute, setMarker, setMarkerRoute } = useUpsertStore();

  return (
    <Dialog
      opened={Boolean(markerRoute || marker)}
      position={{ top: 58, right: 7 }}
      withCloseButton
      onClose={() => {
        if (markerRoute) {
          setMarkerRoute(undefined);
        }
        if (marker) {
          setMarker(undefined);
        }
      }}
    >
      {markerRoute && (
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <SelectRoute
              markerRoute={markerRoute === true ? undefined : markerRoute}
              onClose={() => setMarkerRoute(undefined)}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {marker && (
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <AddResources
              marker={marker === true ? undefined : marker}
              onClose={() => setMarker(undefined)}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </Dialog>
  );
}

export default UpsertArea;
