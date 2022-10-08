import { useMarkers } from '../../contexts/MarkersContext';
import { getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import type { MarkerFull } from './useMarker';
import useMarker from './useMarker';
import { findMapDetails, mapFilters } from 'static';
import styles from './MarkerDetails.module.css';
import Markdown from 'markdown-to-jsx';
import HideMarkerInput from './HideMarkerInput';
import { useModal } from '../../contexts/ModalContext';
import { useAccount } from '../../contexts/UserContext';
import Credit from './Credit';
import { writeError } from '../../utils/logs';
import { deleteMarker } from './api';
import { notify } from '../../utils/notifications';
import Confirm from '../Confirm/Confirm';
import Coordinates from './Coordinates';
import ReportIssue from '../AddComment/ReportIssue';
import Loot from './Loot/Loot';
import {
  Button,
  Drawer,
  Group,
  Image,
  ScrollArea,
  Space,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import ImagePreview from './ImagePreview';

type MarkerDetailsProps = {
  nodeId: string;
  onEdit: (marker: MarkerFull) => void;
};

function MarkerDetails({ nodeId, onEdit }: MarkerDetailsProps): JSX.Element {
  const { marker, comments, loading, refresh } = useMarker(nodeId);
  const { addModal, closeLatestModal } = useModal();
  const { setMarkers } = useMarkers();
  const { account } = useAccount();
  const navigate = useNavigate();

  // async function handleUploadScreenshot(screenshotId?: string) {
  //   try {
  //     closeLatestModal();
  //     if (!screenshotId || !marker) {
  //       return;
  //     }
  //     const patchedMarker = await notify(
  //       patchMarker(marker._id, { ...marker, screenshotId })
  //     );
  //     marker.screenshotFilename = patchedMarker.screenshotFilename;
  //     setMarkers((markers) => {
  //       const markersClone = [...markers];
  //       const index = markersClone.findIndex(
  //         (marker) => marker._id === patchedMarker._id
  //       );
  //       if (index === -1) {
  //         return markers;
  //       }
  //       markersClone[index] = patchedMarker;
  //       return markersClone;
  //     });
  //   } catch (error) {
  //     writeError(error);
  //   }
  // }

  async function handleDelete() {
    if (!marker) {
      return;
    }
    try {
      await notify(deleteMarker(marker._id), {
        success: 'Marker deleted 👌',
      });
      setMarkers((markers) =>
        markers.filter((existingMarker) => existingMarker._id !== marker._id)
      );
      refresh();
      closeLatestModal();
    } catch (error) {
      writeError(error);
    }
  }

  if (!marker) {
    return <></>;
  }

  const filterItem = mapFilters.find(
    (mapFilter) => mapFilter.type === marker.type
  );

  if (!filterItem) {
    return <></>;
  }

  return (
    <Drawer
      opened={true}
      withOverlay={false}
      zIndex={99999}
      padding="md"
      size="xl"
      onClose={() => {
        if (!marker.map) {
          navigate(`/${location.search}`);
        } else {
          const mapDetail = findMapDetails(marker.map);
          if (mapDetail) {
            navigate(`/${mapDetail.title}${location.search}`);
          }
        }
      }}
    >
      <Stack style={{ height: 'calc(100% - 50px)' }}>
        <Title order={3}>
          <Group>
            <Image width={32} height={32} src={filterItem.iconUrl} alt="" />{' '}
            {marker.chestType
              ? `${marker.chestType} Chest T${marker.tier}`
              : marker.name || filterItem.title}
          </Group>
        </Title>
        {marker.name && <Text color="cyan">{filterItem.title}</Text>}
        {marker.level && <Text>Level {marker.level}</Text>}
        {marker.description && <Markdown>{marker.description}</Markdown>}
        <Coordinates position={marker.position} />
        <Text size="xs">
          Added {marker && toTimeAgo(new Date(marker.createdAt))}
        </Text>
        {marker.username && <Credit username={marker.username} />}

        <Text italic>
          <Markdown>{marker.description ?? 'No description'}</Markdown>
        </Text>
        {marker.screenshotFilename && (
          <ImagePreview src={getScreenshotUrl(marker.screenshotFilename)} />
        )}
        <Space h="md" />
        <ScrollArea style={{ flex: 1 }}>
          {['boss', 'bossElite', 'rafflebones_25', 'rafflebones_66'].includes(
            marker.type
          ) && <Loot markerId={marker._id} className={styles.loot} />}

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
                  (account.isModerator || account.steamId === comment.userId)
              )}
              onRemove={() => {
                refresh();
                setMarkers((markers) => {
                  const markersClone = [...markers];
                  const index = markersClone.findIndex(
                    (marker) => marker._id === comment.markerId
                  );
                  if (index === -1) {
                    return markers;
                  }
                  markersClone[index].comments =
                    markersClone[index].comments! - 1;
                  return markersClone;
                });
              }}
            />
          ))}
        </ScrollArea>
        {!loading && comments?.length === 0 && (
          <Text>Be the first to write a comment</Text>
        )}
        <AddComment markerId={marker._id} onAdd={refresh} />
        <HideMarkerInput markerId={marker._id} />
        <Button
          color="teal"
          onClick={() =>
            addModal({
              title: 'Report an issue',
              children: (
                <ReportIssue
                  markerId={marker._id}
                  onAdd={() => {
                    refresh();
                    closeLatestModal();
                  }}
                />
              ),
              fitContent: true,
            })
          }
          disabled={!account}
        >
          ⚠️ {account ? 'Report an issue' : 'Login to report an issue'}
        </Button>
        {account && (account.isModerator || account.steamId === marker.userId) && (
          <>
            <Button color="teal" onClick={() => onEdit(marker)}>
              ✍ Edit marker
            </Button>
            <Button
              color="red"
              onClick={() => {
                addModal({
                  title: 'Do you really want to delete this marker?',
                  children: <Confirm onConfirm={handleDelete} />,
                  fitContent: true,
                });
              }}
            >
              💀 Remove invalid marker 💀
            </Button>
          </>
        )}
        {/* <button
          onClick={() =>
            addModal({
              title: 'Add screenshot',
              children: <UploadScreenshot onUpload={handleUploadScreenshot} />,
            })
          }
        >
          <img className={styles.preview} src={'/icon.png'} alt="" />
          Take a screenshot
        </button> */}
      </Stack>
    </Drawer>
  );
}

export default MarkerDetails;
