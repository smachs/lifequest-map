import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  MediaQuery,
  Skeleton,
} from '@mantine/core';
import { IconFlag, IconMapPin, IconRoute2 } from '@tabler/icons';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useView } from '../../utils/routes';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import type { MarkerFull } from '../MarkerDetails/useMarker';
import MarkerRouteDetails from '../MarkerRoutes/MarkerRouteDetails';
import type { MarkerRouteItem } from '../MarkerRoutes/MarkerRoutes';
const MarkersView = lazy(() => import('../MapFilter/MarkersView'));
const MarkerRoutes = lazy(() => import('../MarkerRoutes/MarkerRoutes'));
const Influences = lazy(() => import('../Influences/Influences'));

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

  return (
    <>
      <MediaQuery
        smallerThan="sm"
        styles={{
          display: 'none',
        }}
      >
        <Group spacing="xs">
          <Button
            variant="default"
            component={Link}
            to={toView({ section: 'nodes' })}
            leftIcon={<IconMapPin />}
            radius="xl"
          >
            Nodes
          </Button>
          <Button
            component={Link}
            to={toView({ section: 'routes' })}
            leftIcon={<IconRoute2 />}
            variant="default"
            radius="xl"
          >
            Routes
          </Button>
          <Button
            component={Link}
            to={toView({ section: 'influences' })}
            leftIcon={<IconFlag />}
            variant="default"
            radius="xl"
          >
            Influences
          </Button>
        </Group>
      </MediaQuery>
      <MediaQuery
        largerThan="sm"
        styles={{
          display: 'none',
        }}
      >
        <Group spacing="xs">
          <ActionIcon
            size="lg"
            radius="xl"
            variant="default"
            component={Link}
            to={toView({ section: 'nodes' })}
            aria-label="Nodes"
          >
            <IconMapPin />
          </ActionIcon>
          <ActionIcon
            size="lg"
            radius="xl"
            variant="default"
            component={Link}
            to={toView({ section: 'routes' })}
            aria-label="Routes"
          >
            <IconRoute2 />
          </ActionIcon>
          <ActionIcon
            size="lg"
            radius="xl"
            variant="default"
            component={Link}
            to={toView({ section: 'influences' })}
            aria-label="Influences"
          >
            <IconFlag />
          </ActionIcon>
        </Group>
      </MediaQuery>
      <Drawer
        opened={view.section === 'nodes'}
        onClose={() => setView({ section: null })}
        title="Nodes"
        padding="sm"
        size="xl"
        withOverlay={false}
      >
        <Suspense fallback={<Skeleton height={40} />}>
          <MarkersView onAdd={onMarkerCreate} />
        </Suspense>
      </Drawer>
      <MarkerDetails onEdit={onMarkerEdit} />
      <Drawer
        opened={view.section === 'routes'}
        onClose={() => setView({ section: null })}
        title="Routes"
        padding="sm"
        size="xl"
        withOverlay={false}
      >
        <Suspense fallback={<Skeleton height={40} />}>
          <MarkerRoutes onEdit={onMarkerRouteUpsert} />
        </Suspense>
      </Drawer>
      <MarkerRouteDetails onEdit={onMarkerRouteUpsert} />
      <Drawer
        opened={view.section === 'influences'}
        onClose={() => setView({ section: null })}
        title="Influences"
        padding="sm"
        size="xl"
        withOverlay={false}
      >
        <Suspense fallback={<Skeleton height={40} />}>
          <Influences />
        </Suspense>
      </Drawer>
    </>
  );
};

export default NavActions;
