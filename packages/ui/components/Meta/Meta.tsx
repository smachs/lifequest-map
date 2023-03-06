import { Helmet } from 'react-helmet-async';

type MetaProps = {
  title: string;
  description?: string;
};
const Meta = (props: MetaProps) => {
  const title = `${props.title} - New World Map - aeternum-map.gg`;
  const description =
    props.description ||
    'Maximize your New World gameplay with Aeternum Map! Discover locations, chests, lore, expeditions & more. Realtime tracking & farming routes. Open-source companion app.';
  const url = location.origin + location.pathname;
  return (
    <Helmet prioritizeSeoTags>
      <link rel="canonical" href={url} />

      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      <meta property="twitter:card" content="summary" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
    </Helmet>
  );
};

export default Meta;
