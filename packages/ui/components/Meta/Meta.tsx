import { Helmet } from 'react-helmet-async';
import { useRealmStore } from '../../utils/realmStore';

type MetaProps = {
  title: string;
  description?: string;
};
const Meta = (props: MetaProps) => {
  const isPTR = useRealmStore((state) => state.isPTR);

  const contentTitle = `${props.title}${
    isPTR ? ' - Public Test Realm' : ''
  } - New World Map - aeternum-map.gg`;
  const contentDescription = `${
    props.description ? ` ${props.description} ` : ''
  }Maximize your New World gameplay with Aeternum Map${
    isPTR ? ' on Public Test Realm (PTR)' : ''
  }! Discover locations, chests, lore, expeditions & more. Realtime tracking & farming routes. Open-source companion app.`;

  const url = location.origin + location.pathname;
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={url} />

      <title>{contentTitle}</title>
      <meta name="description" content={contentDescription} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={contentTitle} />
      <meta property="og:description" content={contentDescription} />

      <meta property="twitter:card" content="summary" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={contentTitle} />
      <meta property="twitter:description" content={contentDescription} />
    </Helmet>
  );
};

export default Meta;
