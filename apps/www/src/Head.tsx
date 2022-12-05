import { Helmet } from 'react-helmet-async';
import { mapIsAeternumMap } from 'static';

type Props = {
  map: string;
};
const Head = ({ map }: Props) => {
  const isAeternumMap = mapIsAeternumMap(map);
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
