import { useCallback, useEffect, useState } from 'react';
import { fetchJSON } from '../../utils/api';
import { notify } from '../../utils/notifications';
import type { MarkerRouteItem } from './MarkerRoutes';

const useMarkerRoute = (markerRouteId?: string) => {
  const [result, setResult] = useState<MarkerRouteItem | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!markerRouteId) {
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return await notify(
      fetchJSON<MarkerRouteItem>(`/api/marker-routes/${markerRouteId}`)
        .then((markerRoute) => setResult(markerRoute))
        .catch(() => setResult(null))
        .finally(() => setLoading(false))
    );
  }, [markerRouteId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    markerRoute: result,
    loading,
    refresh,
  };
};

export default useMarkerRoute;
