import {
  Button,
  Drawer,
  Image,
  List,
  ScrollArea,
  Skeleton,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { IconArrowFork } from '@tabler/icons';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilterItem } from 'static';
import { findMapDetails, mapFilters } from 'static';
import { useFilters } from '../../contexts/FiltersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { useAccount } from '../../contexts/UserContext';
import { toTimeAgo } from '../../utils/dates';
import Markdown from '../Markdown/Markdown';
import Credit from '../MarkerDetails/Credit';
import type { MarkerRouteItem } from './MarkerRoutes';
import useMarkerRoute from './useMarkerRoute';

type MarkerRouteDetailsProps = {
  markerRouteId?: string;
  onEdit: (markerRoute: MarkerRouteItem) => void;
};
const MarkerRouteDetails = ({
  markerRouteId,
  onEdit,
}: MarkerRouteDetailsProps) => {
  const { markerRoute, refresh, loading } = useMarkerRoute(markerRouteId);
  const navigate = useNavigate();
  const { account, refreshAccount } = useAccount();
  const {
    markerRoutes,
    clearMarkerRoutes,
    toggleMarkerRoute,
    refreshMarkerRoutes,
    visibleMarkerRoutes,
  } = useMarkers();
  const { filters, setFilters } = useFilters();

  const handleClose = () => {
    if (!markerRoute || !markerRoute.map) {
      navigate(`/${location.search}`);
    } else {
      const mapDetail = findMapDetails(markerRoute.map);
      if (mapDetail) {
        navigate(`/${mapDetail.title}${location.search}`);
      }
    }
  };

  const markerMapFilters: FilterItem[] = useMemo(() => {
    if (!markerRoute) {
      return [];
    }
    const result: FilterItem[] = [];
    Object.keys(markerRoute.markersByType).forEach((markerType) => {
      const mapFilter = mapFilters.find(
        (mapFilter) => mapFilter.type === markerType
      );
      if (mapFilter) {
        result.push(mapFilter);
      }
    });
    return result;
  }, [markerRoute?.markersByType]);

  function handleEdit(markerRoute: MarkerRouteItem) {
    toggleMarkerRoute(markerRoute, false);
    const types = Object.keys(markerRoute.markersByType);
    setFilters((filters) => [
      ...filters,
      ...types.filter((type) => !filters.includes(type)),
    ]);
    onEdit(markerRoute);
  }

  const editable =
    account &&
    markerRoute &&
    (account.isModerator || account.steamId === markerRoute.userId);
  const selected = Boolean(
    markerRoute &&
      markerRoutes.some(
        (selectedMarkerRoute) => selectedMarkerRoute._id == markerRoute._id
      )
  );
  return (
    <Drawer
      opened={!!markerRouteId}
      withOverlay={false}
      zIndex={99999}
      padding="sm"
      size="xl"
      styles={(theme) => ({
        header: {
          marginBottom: theme.spacing.xs,
        },
      })}
      title={
        markerRoute && !loading ? (
          <Text>{markerRoute.name}</Text>
        ) : (
          <Skeleton height={20} width={120} />
        )
      }
      onClose={handleClose}
    >
      {(!markerRoute || loading) && <Skeleton height={50} />}
      {markerRoute && !loading && (
        <Stack style={{ height: 'calc(100% - 50px)' }} spacing="xs">
          <Text
            size="sm"
            color={markerRoute.isPublic ? 'lime' : 'teal'}
            weight="bold"
          >
            {markerRoute.isPublic ? 'Public' : 'Private'}
          </Text>
          <Text size="sm" color="cyan" weight="bold">
            {markerRoute.regions.join(', ')}
          </Text>
          <Text size="xs">
            Added {markerRoute && toTimeAgo(new Date(markerRoute.createdAt))}{' '}
            {markerRoute.username && <Credit username={markerRoute.username} />}
          </Text>
          {markerRoute.description && (
            <Text italic size="sm">
              <Markdown>{markerRoute.description}</Markdown>
            </Text>
          )}
          <ScrollArea style={{ flex: 1, minHeight: 100 }}>
            <List
              spacing="xs"
              styles={{
                itemWrapper: {
                  width: '100%',
                },
              }}
            >
              {loading && <Skeleton height={40} />}
              {!loading && markerMapFilters.length === 0 && 'No markers'}
              {!loading &&
                markerMapFilters.map((markerMapFilter) => (
                  <List.Item
                    key={markerMapFilter.type}
                    icon={
                      <Image
                        src={markerMapFilter.iconUrl}
                        alt={markerMapFilter.type}
                        width={24}
                        height={24}
                      />
                    }
                    sx={{
                      width: '100%',
                    }}
                  >
                    {markerMapFilter.title}:{' '}
                    {markerRoute.markersByType[markerMapFilter.type]}x
                  </List.Item>
                ))}
            </List>
          </ScrollArea>

          <Button
            title="Toggle route"
            variant={selected ? 'filled' : 'outline'}
            color="green"
            onClick={() => {
              toggleMarkerRoute(markerRoute, !selected);
            }}
          >
            {selected ? 'Visible' : 'Not visible'}
          </Button>
          <Button
            color="teal"
            leftIcon={<IconArrowFork />}
            onClick={() => {
              handleEdit(markerRoute);
              handleClose();
            }}
          >
            Fork this route ({markerRoute.forks || 0} times)
          </Button>
          <Button color="orange"></Button>
          {editable && (
            <Button
              color="teal"
              leftIcon="✍"
              onClick={() => {
                handleEdit(markerRoute);
                handleClose();
              }}
            >
              Edit route
            </Button>
          )}
        </Stack>
      )}
    </Drawer>
  );
};

export default MarkerRouteDetails;
