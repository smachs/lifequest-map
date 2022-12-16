import { useEffect } from 'react';
import Meta from 'ui/components/Meta/Meta';
import { useUpsertStore } from 'ui/components/UpsertArea/upsertStore';
import { useRouteParams } from 'ui/utils/routes';

const Head = () => {
  const { map, nodeId, routeId } = useRouteParams();
  const upsertStore = useUpsertStore();

  useEffect(() => {
    upsertStore.setMarker(undefined);
    upsertStore.setMarkerRoute(undefined);
  }, [map]);

  return <>{!nodeId && !routeId && <Meta title={map} />}</>;
};

export default Head;
