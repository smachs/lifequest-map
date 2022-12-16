import { getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import useMarker from './useMarker';
import type { Glyph } from 'static';
import { findRegions } from 'static';
import { findMapDetails, glyphs, mapFilters } from 'static';
import HideMarkerInput from './HideMarkerInput';
import Credit from './Credit';
import Coordinates from './Coordinates';
import Loot from './Loot/Loot';
import {
  Badge,
  Button,
  Avatar,
  Drawer,
  Group,
  Image,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import ImagePreview from './ImagePreview';
import { lootableMapFilters } from 'static';
import ReportIssueButton from './ReportIssueButton';
import DeleteNode from './DeleteNode';
import Markdown from '../Markdown/Markdown';
import { useUserStore } from '../../utils/userStore';
import { isEmbed, useRouteParams } from '../../utils/routes';
import { IconMapPin } from '@tabler/icons';
import { useQueryClient } from '@tanstack/react-query';
import Meta from '../Meta/Meta';
import { useUpsertStore } from '../UpsertArea/upsertStore';

function MarkerDetails(): JSX.Element {
  const { nodeId } = useRouteParams();
  const upsertStore = useUpsertStore();
  const { data, refetch, isLoading } = useMarker(nodeId);
  const queryClient = useQueryClient();
  const account = useUserStore((state) => state.account);
  const navigate = useNavigate();

  const marker = data?.marker;
  const comments = data?.comments;
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
    let url = 'https://aeternum-map.gg/';
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

  const region = marker
    ? findRegions([[marker.position[1], marker.position[0]]], marker.map)[0]
    : null;

  return (
    <Drawer
      opened={!!nodeId}
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
        filterItem && !isLoading ? (
          <Group>
            <Image width={32} height={32} src={filterItem.iconUrl} alt="" />{' '}
            {marker.chestType
              ? `${marker.chestType} Chest T${marker.tier}`
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
        <Stack style={{ height: 'calc(100vh - 64px)' }} spacing="xs">
          <Meta
            title={marker.name || filterItem.title}
            description={`A ${filterItem.title} in ${region}.`}
          />

          <Group>
            {marker.name && (
              <Badge size="sm" color="cyan">
                {filterItem.title}
              </Badge>
            )}
            {marker.level && <Badge size="sm">Level {marker.level}</Badge>}
            {marker.hp && (
              <Badge size="sm" color="orange">
                {marker.hp} HP
              </Badge>
            )}
            {marker.customRespawnTimer && (
              <Badge size="sm" color="lime">
                Respawns {marker.customRespawnTimer}s
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
                leftSection={<Avatar size={18} mr={0} src={glyph.iconUrl} />}
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
            <Text italic size="sm">
              <Markdown>{marker.description}</Markdown>
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
