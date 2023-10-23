import {
  Badge,
  Button,
  Drawer,
  Group,
  List,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconRoute2 } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import leaflet from 'leaflet';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilterItem } from 'static';
import { findMapDetails, getRouteMeta, mapFilters } from 'static';
import { shallow } from 'zustand/shallow';
import { useMarkers } from '../../contexts/MarkersContext';
import { toTimeAgo } from '../../utils/dates';
import { notify } from '../../utils/notifications';
import { isEmbed, useRouteParams } from '../../utils/routes';
import { useUserStore } from '../../utils/userStore';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import Markdown from '../Markdown/Markdown';
import Credit from '../MarkerDetails/Credit';
import ReportIssueButton from '../MarkerDetails/ReportIssueButton';
import Meta from '../Meta/Meta';
import { useUpsertStore } from '../UpsertArea/upsertStore';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import DeleteRoute from './DeleteRoute';
import ForkRoute from './ForkRoute';
import type { MarkerRouteItem } from './MarkerRoutes';
import { patchFavoriteMarkerRoute } from './api';
import useMarkerRoute from './useMarkerRoute';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

const MarkerRouteDetails = () => {
  const { routeId } = useRouteParams();
  const { data, refetch, isLoading } = useMarkerRoute(routeId);
  const navigate = useNavigate();
  const upsertStore = useUpsertStore();
  const { account, refreshAccount } = useUserStore(
    (state) => ({
      account: state.account,
      refreshAccount: state.refreshAccount,
    }),
    shallow
  );
  const { markerRoutes, toggleMarkerRoute } = useMarkers();
  const queryClient = useQueryClient();

  const markerRoute = data?.markerRoute;
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

  useEffect(() => {
    if (!markerRoute || !latestLeafletMap) {
      return;
    }
    latestLeafletMap.fitBounds(markerRoute.positions);
  }, [markerRoute?._id]);

  useEffect(() => {
    if (!markerRoute || !latestLeafletMap || selected) {
      return;
    }

    const layerGroup = new leaflet.LayerGroup();

    const startHereCircle = leaflet.circle(markerRoute.positions[0], {
      pmIgnore: true,
      color: 'rgba(51, 136, 255, 0.7)',
    });
    const line = leaflet.polyline(markerRoute.positions, {
      pmIgnore: true,
      color: 'rgba(51, 136, 255, 0.7)',
    });
    startHereCircle.addTo(layerGroup);
    line.addTo(layerGroup);
    layerGroup.addTo(latestLeafletMap);

    if (markerRoute.texts) {
      for (let j = 0; j < markerRoute.texts.length; j++) {
        const { text, position } = markerRoute.texts[j];

        const textLabel = leaflet.marker(position as [number, number], {
          icon: leaflet.divIcon({
            className: 'leaflet-polygon-text',
            html: text,
          }),
          interactive: false,
        });

        textLabel.addTo(layerGroup);
      }
    }

    return () => {
      layerGroup.off();
      layerGroup.remove();
    };
  }, [markerRoute?._id, selected]);

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
    upsertStore.setMarkerRoute(markerRoute);
  }

  const isFavorite = Boolean(
    markerRoute &&
      account?.favoriteRouteIds?.some((routeId) => markerRoute._id === routeId)
  );

  async function handleFavorite(): Promise<void> {
    if (!account || !routeId) {
      return;
    }

    try {
      await notify(patchFavoriteMarkerRoute(routeId, !isFavorite), {
        success: 'Favored route changed 👌',
      });
      refreshAccount();
      refetch();
    } catch (error) {
      console.error(error);
    }
  }

  if (isEmbed) {
    if (!routeId) {
      return <></>;
    }
    let url = 'https://aeternum-map.gg/';
    if (markerRoute?.map) {
      const mapDetails = findMapDetails(markerRoute.map);
      if (mapDetails) {
        url += `${mapDetails.title}/`;
      }
    }
    url += `routes/${routeId}`;

    return (
      <Button
        variant="default"
        component="a"
        href={url}
        target="_blank"
        leftIcon={<IconRoute2 />}
        radius="xl"
        loading={!markerRoute}
      >
        {markerRoute?.name || 'Route'}
      </Button>
    );
  }

  return (
    <Drawer
      opened={!!routeId}
      withOverlay={false}
      size={500}
      styles={{
        header: {
          zIndex: 10,
        },
        body: {
          width: 500,
        },
      }}
      title={
        markerRoute ? (
          <Text>{markerRoute.name}</Text>
        ) : (
          <Skeleton height={20} width={120} />
        )
      }
      onClose={handleClose}
    >
      {!markerRoute && <Skeleton height={50} />}
      {markerRoute && (
        <Stack style={{ height: 'calc(100vh - 74px)' }} spacing="xs">
          <Meta {...getRouteMeta(markerRoute)} />
          <Group>
            <Badge size="sm" color="cyan">
              {markerRoute.regions.join(', ')}
            </Badge>
            <Badge size="sm" color={markerRoute.isPublic ? 'lime' : 'teal'}>
              {markerRoute.isPublic ? 'Public' : 'Private'}
            </Badge>
            <Badge leftSection="🤘" size="sm" color="orange">
              {markerRoute.favorites || 0} favored
            </Badge>
            <Badge size="sm" color="indigo">
              Used By: {markerRoute.usageCount ?? 0}
            </Badge>
            <Badge size="sm" color="red">
              Last Usage:{' '}
              {markerRoute.lastUsedAt
                ? toTimeAgo(new Date(markerRoute.lastUsedAt))
                : 'Never'}
            </Badge>
          </Group>
          <Text size="xs">
            Updated {markerRoute && toTimeAgo(new Date(markerRoute.updatedAt))}{' '}
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
              {markerMapFilters.length === 0 && isLoading && (
                <Skeleton height={40} />
              )}
              {markerMapFilters.length === 0 && !isLoading && 'No markers'}
              {markerMapFilters.map((markerMapFilter) => (
                <List.Item
                  key={markerMapFilter.type}
                  icon={
                    <img
                      src={`${VITE_API_ENDPOINT}/assets${markerMapFilter.iconUrl}?v=3`}
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
            <Stack spacing="xs">
              {data?.comments.map((comment) => (
                <Comment
                  key={comment._id}
                  id={comment._id}
                  username={comment.username}
                  message={comment.message}
                  createdAt={comment.createdAt}
                  isIssue={comment.isIssue}
                  removable={Boolean(
                    account &&
                      (account.isModerator ||
                        account.steamId === comment.userId)
                  )}
                  onRemove={() => {
                    refetch();
                    queryClient.invalidateQueries(['routes']);
                  }}
                />
              ))}
            </Stack>
          </ScrollArea>
          <AddComment markerRouteId={markerRoute._id} onAdd={refetch} />

          <Button
            title="Toggle route"
            variant={selected ? 'filled' : 'outline'}
            color="blue"
            onClick={() => {
              toggleMarkerRoute(markerRoute);
            }}
          >
            {selected ? 'Deselect route' : 'Select route'}
          </Button>
          <Button
            title="Toggle favorite"
            variant={isFavorite ? 'filled' : 'outline'}
            color="orange"
            disabled={!account}
            onClick={handleFavorite}
          >
            {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </Button>
          <ForkRoute
            markerRoute={markerRoute}
            onFork={async (markerRoute) => {
              toggleMarkerRoute(markerRoute, true);
              queryClient.invalidateQueries(['routes']);
              if (!markerRoute || !markerRoute.map) {
                navigate(`/routes/${markerRoute._id}/${location.search}`);
              } else {
                const mapDetail = findMapDetails(markerRoute.map);
                if (mapDetail) {
                  navigate(
                    `/${mapDetail.title}/routes/${markerRoute._id}${location.search}`
                  );
                }
              }
            }}
          />
          <ReportIssueButton
            markerRouteId={markerRoute._id}
            onReport={refetch}
          />
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
          <DeleteRoute
            routeId={markerRoute._id}
            onDelete={async () => {
              toggleMarkerRoute(markerRoute, false);
              queryClient.invalidateQueries(['routes']);
              handleClose();
            }}
          />
        </Stack>
      )}
    </Drawer>
  );
};

export default MarkerRouteDetails;
