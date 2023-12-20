import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Glyph } from 'static';
import {
  findMapDetails,
  getNodeMeta,
  glyphs,
  lootableMapFilters,
  mapFilters,
} from 'static';
import { getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import { isEmbed, useRouteParams } from '../../utils/routes';
import { useUserStore } from '../../utils/userStore';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import Meta from '../Meta/Meta';
import { useUpsertStore } from '../UpsertArea/upsertStore';
import { latestLeafletMap } from '../WorldMap/useWorldMap';
import Coordinates from './Coordinates';
import Credit from './Credit';
import DeleteNode from './DeleteNode';
import HideMarkerInput from './HideMarkerInput';
import ImagePreview from './ImagePreview';
import Loot from './Loot/Loot';
import ReportIssueButton from './ReportIssueButton';
import useMarker from './useMarker';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

function MarkerDetails(): JSX.Element {
  const { nodeId } = useRouteParams();
  const upsertStore = useUpsertStore();
  const { data, refetch, isLoading } = useMarker(nodeId);
  const queryClient = useQueryClient();
  const account = useUserStore((state) => state.account);
  const navigate = useNavigate();

  const marker = data?.marker;
  const comments = data?.comments;

  const shouldPanTo = useRef(Boolean(nodeId));
  useEffect(() => {
    if (marker && shouldPanTo.current && latestLeafletMap) {
      latestLeafletMap.panTo([marker.position[1], marker.position[0]]);
      shouldPanTo.current = false;
    }
  }, [marker?._id]);

  const handleClose = () => {
    if (!marker || !marker.map) {
      navigate(`/${location.search}`);
    } else {
      const mapDetail = findMapDetails(marker.map);
      if (mapDetail) {
        navigate(`/${mapDetail.title}${location.search}`);
      }
    }
  };
  const filterItem =
    marker && mapFilters.find((mapFilter) => mapFilter.type === marker.type);
  const glyph =
    marker?.requiredGlyphId &&
    glyphs.find((glyph: Glyph) => glyph.id === marker?.requiredGlyphId);

  if (isEmbed) {
    if (!nodeId) {
      return <></>;
    }
    let url = 'https://aeternum-map.th.gl/';
    if (marker?.map) {
      const mapDetails = findMapDetails(marker.map);
      if (mapDetails) {
        url += `${mapDetails.title}/`;
      }
    }
    url += `nodes/${marker?._id}`;
    return (
      <Button
        variant="default"
        component="a"
        href={url}
        target="_blank"
        leftIcon={<IconMapPin />}
        radius="xl"
        loading={!marker}
      >
        {marker?.name || filterItem?.title || 'Node'}
      </Button>
    );
  }

  return (
    <Drawer
      opened={!!nodeId}
      withOverlay={false}
      zIndex={99999}
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
        filterItem && !isLoading ? (
          <Group>
            <img
              width={32}
              height={32}
              src={`${VITE_API_ENDPOINT}/assets${filterItem.iconUrl}?v=4`}
              alt=""
            />{' '}
            {marker.chestType
              ? `${
                  filterItem.type.includes('Supplies')
                    ? `${filterItem.title.includes('Elite') ? 'Elite ' : ''}${
                        marker.chestType
                      } ${filterItem.title.split(' ').pop()}`
                    : filterItem.title
                } T${marker.tier}`
              : marker.name || filterItem.title}
          </Group>
        ) : (
          <Skeleton height={20} width={120} />
        )
      }
      onClose={handleClose}
    >
      {(!filterItem || isLoading) && <Skeleton height={50} />}
      {filterItem && !isLoading && (
        <Stack style={{ height: 'calc(100vh - 80px)' }} spacing="xs">
          <Meta {...getNodeMeta(marker)} />

          <Group>
            {marker.name && (
              <Badge size="sm" color="cyan">
                {filterItem.title}
              </Badge>
            )}
            {marker.level && <Badge size="sm">Level {marker.level}</Badge>}
            {marker.hp && (
              <Badge size="sm" color="orange">
                {marker.hp.toLocaleString('en')} HP
              </Badge>
            )}
            {marker.customRespawnTimer && (
              <Badge size="sm" color="lime">
                Respawns {marker.customRespawnTimer}s
              </Badge>
            )}
            {marker.isTemporary && (
              <Badge size="sm" color="teal">
                Temporary/Randomly
              </Badge>
            )}
            {marker.realm && (
              <Badge size="sm" color="orange">
                {marker.realm.toUpperCase()} Only
              </Badge>
            )}
            <Coordinates position={marker.position} />
          </Group>
          {glyph && (
            <Group spacing="xs">
              <Text size="xs">Requires Glyph</Text>
              <Badge
                size="sm"
                color="red"
                leftSection={
                  <Avatar
                    size={18}
                    mr={0}
                    src={`${VITE_API_ENDPOINT}/assets${glyph.iconUrl}?v=4`}
                  />
                }
              >
                <Text size="xs">{glyph.name + ' (' + glyph.id + ')'}</Text>
              </Badge>
            </Group>
          )}
          <Text size="xs">
            Added {marker && toTimeAgo(new Date(marker.createdAt))}{' '}
            {marker.username && <Credit username={marker.username} />}
          </Text>
          {marker.description && (
            <Text
              italic
              size="sm"
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                overflowWrap: 'break-word',
                whiteSpace: 'pre',
              }}
            >
              {marker.description}
            </Text>
          )}
          {marker.screenshotFilename && (
            <ImagePreview src={getScreenshotUrl(marker.screenshotFilename)} />
          )}
          {lootableMapFilters.includes(marker.type) && (
            <ScrollArea style={{ flex: 1, minHeight: 100 }}>
              <Loot markerId={marker._id} />
            </ScrollArea>
          )}
          <ScrollArea
            style={
              lootableMapFilters.includes(marker.type) ? {} : { flexGrow: 1 }
            }
          >
            <Stack spacing="xs">
              {comments?.map((comment) => (
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
                    queryClient.invalidateQueries(['markers']);
                  }}
                />
              ))}
            </Stack>
          </ScrollArea>
          <AddComment markerId={marker._id} onAdd={refetch} />
          <HideMarkerInput markerId={marker._id} />
          <ReportIssueButton markerId={marker._id} onReport={refetch} />
          {account &&
            (account.isModerator || account.steamId === marker.userId) && (
              <>
                <Button
                  color="teal"
                  leftIcon="✍"
                  onClick={() => {
                    upsertStore.setMarker(marker);
                    handleClose();
                  }}
                >
                  Edit node
                </Button>
                <DeleteNode
                  markerId={marker._id}
                  onDelete={() => {
                    queryClient.invalidateQueries(['markers']);
                    refetch();
                    handleClose();
                  }}
                />
              </>
            )}
        </Stack>
      )}
    </Drawer>
  );
}

export default MarkerDetails;
