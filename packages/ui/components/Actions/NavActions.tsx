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
import { isEmbed } from '../../utils/routes';
import { useSettingsStore } from '../../utils/settingsStore';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import InfluenceDetails from '../Influences/InfluenceDetails';
import MarkerDetails from '../MarkerDetails/MarkerDetails';
import MarkerRouteDetails from '../MarkerRoutes/MarkerRouteDetails';
const MarkersView = lazy(() => import('../MapFilter/MarkersView'));
const MarkerRoutes = lazy(() => import('../MarkerRoutes/MarkerRoutes'));
const Influences = lazy(() => import('../Influences/Influences'));

const NavActions = () => {
  const section = useSettingsStore((state) => state.section);
  const setSection = useSettingsStore((state) => state.setSection);
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
            onClick={() => setSection('nodes')}
            leftIcon={<IconMapPin />}
            radius="xl"
          >
            Nodes
          </Button>
          <Button
            onClick={() => setSection('routes')}
            leftIcon={<IconRoute2 />}
            variant="default"
            radius="xl"
          >
            Routes
          </Button>
          <Button
            onClick={() => setSection('influences')}
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
            onClick={() => setSection('nodes')}
            aria-label="Nodes"
          >
            <IconMapPin />
          </ActionIcon>
          <ActionIcon
            size="lg"
            radius="xl"
            variant="default"
            onClick={() => setSection('routes')}
            aria-label="Routes"
          >
            <IconRoute2 />
          </ActionIcon>
          <ActionIcon
            size="lg"
            radius="xl"
            variant="default"
            onClick={() => setSection('influences')}
            aria-label="Influences"
          >
            <IconFlag />
          </ActionIcon>
        </Group>
      </MediaQuery>
      <Drawer
        opened={section === 'nodes'}
        onClose={() => setSection(null)}
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
        opened={section === 'routes'}
        onClose={() => setSection(null)}
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
        opened={section === 'influences'}
        onClose={() => setSection(null)}
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
