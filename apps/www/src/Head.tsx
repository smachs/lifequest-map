import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { mapIsAeternumMap } from 'static';
import Meta from 'ui/components/Meta/Meta';
import { useUpsertStore } from 'ui/components/UpsertArea/upsertStore';
import { useRouteParams } from 'ui/utils/routes';

const Head = () => {
  const { map, nodeId, routeId } = useRouteParams();
  const isAeternumMap = mapIsAeternumMap(map);
  const upsertStore = useUpsertStore();

  useEffect(() => {
    upsertStore.setMarker(undefined);
    upsertStore.setMarkerRoute(undefined);
  }, [map]);

  return (
    <>
      {!nodeId && !routeId && <Meta title={map} />}
      <Helmet prioritizeSeoTags>
        <link
          rel="canonical"
          href={`https://aeternum-map.gg/${isAeternumMap ? '' : map}`}
        />
      </Helmet>
    </>
  );
};

export default Head;
