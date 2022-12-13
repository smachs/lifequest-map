import { Helmet } from 'react-helmet-async';

type MetaProps = {
  title: string;
  description?: string;
};
const Meta = ({ title, description }: MetaProps) => {
  return (
    <Helmet prioritizeSeoTags>
      <title>{title} - New World Map - Aeternum Map</title>
      <meta
        name="description"
        content={
          description ||
          `Get all the New World locations, farming spots, resources, lore documents, chests, mobs and more! The app tracks your position in realtime and displays it on https://aeternum-map.gg. Optimize your resource income with farming routes and coordinate your attacks with group functionality. A free open source companion app for New World.`
        }
      />
    </Helmet>
  );
};

export default Meta;
