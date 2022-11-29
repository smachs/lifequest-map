import { Button, Drawer, Group, MediaQuery, Stack } from '@mantine/core';
import { IconFlag, IconMapPin, IconRoute2 } from '@tabler/icons';
import { Link } from 'react-router-dom';
import { useView } from '../../utils/routes';
import Influences from '../Influences/Influences';
import MarkersView from '../MapFilter/MarkersView';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import type { MarkerFull } from '../MarkerDetails/useMarker';
import MarkerRouteDetails from '../MarkerRoutes/MarkerRouteDetails';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
import MarkerRoutes from '../MarkerRoutes/MarkerRoutes';

type NavActionsProps = {
  onMarkerCreate: () => void;
  onMarkerRouteUpsert: (target: MarkerRouteItem | true) => void;
  onMarkerEdit: (marker: MarkerFull) => void;
};
const NavActions = ({
  onMarkerCreate,
  onMarkerEdit,
  onMarkerRouteUpsert,
}: NavActionsProps) => {
  const { view, toView, setView } = useView();

  const actions = (
    <>
      <Button
        variant="default"
        component={Link}
        to={toView({ section: 'nodes' })}
        leftIcon={<IconMapPin />}
        radius="xl"
      >
        Nodes
      </Button>
      <Drawer
        opened={view.section === 'nodes'}
        onClose={() => setView({ section: null })}
        title="Nodes"
        padding="sm"
        size="xl"
        withOverlay={false}
      >
        <MarkersView onAdd={onMarkerCreate} />
      </Drawer>
      <MarkerDetails onEdit={onMarkerEdit} />
      <Button
        component={Link}
        to={toView({ section: 'routes' })}
        leftIcon={<IconRoute2 />}
        variant="default"
        radius="xl"
      >
        Routes
      </Button>
      <Drawer
        opened={view.section === 'routes'}
        onClose={() => setView({ section: null })}
        title="Routes"
        padding="sm"
        size="xl"
        withOverlay={false}
      >
        <MarkerRoutes onEdit={onMarkerRouteUpsert} />
      </Drawer>
      <MarkerRouteDetails onEdit={onMarkerRouteUpsert} />
      <Button
        component={Link}
        to={toView({ section: 'influences' })}
        leftIcon={<IconFlag />}
        variant="default"
        radius="xl"
      >
        Influences
      </Button>
      <Drawer
        opened={view.section === 'influences'}
        onClose={() => setView({ section: null })}
        title="Influences"
        padding="sm"
        size="xl"
        withOverlay={false}
      >
        <Influences />
      </Drawer>
    </>
  );

  return (
    <>
      <MediaQuery
        smallerThan="sm"
        styles={{
          display: 'none',
        }}
      >
        <Group spacing="xs">{actions}</Group>
      </MediaQuery>
      <MediaQuery
        largerThan="sm"
        styles={{
          display: 'none',
        }}
      >
        <Stack spacing="xs">{actions}</Stack>
      </MediaQuery>
    </>
  );
};

export default NavActions;
