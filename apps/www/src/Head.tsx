import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { mapIsAeternumMap } from 'static';
import { useUpsertStore } from 'ui/components/UpsertArea/upsertStore';
import { useMap } from 'ui/utils/routes';

const Head = () => {
  const map = useMap();
  const isAeternumMap = mapIsAeternumMap(map);
  const upsertStore = useUpsertStore();

  useEffect(() => {
    upsertStore.setMarker(undefined);
    upsertStore.setMarkerRoute(undefined);
  }, [map]);

  return (
    <Helmet prioritizeSeoTags>
      <title>{map} - New World Map</title>
      <meta
        name="description"
        content={`Interactive New World map ${
          isAeternumMap ? '' : `of ${map} `
        } with locations, farming routes, resources, lore documents, chests, mobs, position tracking and more!`}
      />
      <link
        rel="canonical"
        href={`https://aeternum-map.gg/${isAeternumMap ? '' : map}`}
      />
    </Helmet>
  );
};

export default Head;
