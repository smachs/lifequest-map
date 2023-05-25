import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  MediaQuery,
  Skeleton,
  Title,
} from '@mantine/core';
import { IconFlag, IconMap, IconMapPin, IconRoute2 } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { isEmbed, useView } from '../../utils/routes';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import InfluenceDetails from '../Influences/InfluenceDetails';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import MarkerRouteDetails from '../MarkerRoutes/MarkerRouteDetails';
const MarkersView = lazy(() => import('../MapFilter/MarkersView'));
const MarkerRoutes = lazy(() => import('../MarkerRoutes/MarkerRoutes'));
const Influences = lazy(() => import('../Influences/Influences'));

const NavActions = () => {
  const { view, toView, setView } = useView();

  if (isEmbed) {
    return (
      <Group spacing="xs">
        <Button
          variant="default"
          component="a"
          href="https://aeternum-map.gg"
          target="_blank"
          leftIcon={<IconMap />}
          radius="xl"
        >
          Aeternum Map
        </Button>
        <ErrorBoundary>
          <MarkerDetails />
          <MarkerRouteDetails />
          <InfluenceDetails />
        </ErrorBoundary>
      </Group>
    );
  }

  return (
    <>
      <Title order={1} sx={{ display: 'none' }}>
        Aeternum Map - New World Map
      </Title>
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
        size={500}
        withOverlay={false}
        styles={{
          header: {
            zIndex: 10,
          },
          body: {
            width: 500,
          },
        }}
      >
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <MarkersView />
          </Suspense>
        </ErrorBoundary>
      </Drawer>
      <ErrorBoundary>
        <MarkerDetails />
      </ErrorBoundary>
      <Drawer
        opened={view.section === 'routes'}
        onClose={() => setView({ section: null })}
        title="Routes"
        size={500}
        withOverlay={false}
        styles={{
          header: {
            zIndex: 10,
          },
          body: {
            width: 500,
          },
        }}
      >
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <MarkerRoutes />
          </Suspense>
        </ErrorBoundary>
      </Drawer>
      <ErrorBoundary>
        <MarkerRouteDetails />
      </ErrorBoundary>
      <Drawer
        opened={view.section === 'influences'}
        onClose={() => setView({ section: null })}
        title="Influences"
        size={500}
        withOverlay={false}
        styles={{
          header: {
            zIndex: 10,
          },
          body: {
            width: 500,
          },
        }}
      >
        <ErrorBoundary>
          <Suspense fallback={<Skeleton height={40} />}>
            <Influences />
          </Suspense>
        </ErrorBoundary>
      </Drawer>
      <ErrorBoundary>
        <InfluenceDetails />
      </ErrorBoundary>
    </>
  );
};

export default NavActions;
