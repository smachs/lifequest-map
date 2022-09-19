import type { MarkerBasic } from '../../contexts/MarkersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import useMarker from './useMarker';
import Loading from '../Loading/Loading';
import { mapFilters } from 'static';
import styles from './MarkerDetails.module.css';
import Markdown from 'markdown-to-jsx';
import HideMarkerInput from './HideMarkerInput';
import { useModal } from '../../contexts/ModalContext';
import UploadScreenshot from '../AddResources/UploadScreenshot';
import { useAccount } from '../../contexts/UserContext';
import Credit from './Credit';
import { writeError } from '../../utils/logs';
import { deleteMarker } from './api';
import { notify } from '../../utils/notifications';
import Confirm from '../Confirm/Confirm';
import { patchMarker } from '../AddResources/api';
import Coordinates from './Coordinates';
import ReportIssue from '../AddComment/ReportIssue';
import Loot from './Loot/Loot';

type MarkerDetailsProps = {
  marker: MarkerBasic;
  onEdit: () => void;
};

function MarkerDetails({ marker, onEdit }: MarkerDetailsProps): JSX.Element {
  const {
    marker: fullMarker,
    comments,
    loading,
    refresh,
  } = useMarker(marker._id);
  const filterItem = mapFilters.find(
    (mapFilter) => mapFilter.type === marker.type
  );
  const { addModal, closeLatestModal } = useModal();
  const { setMarkers } = useMarkers();
  const { account } = useAccount();

  async function handleUploadScreenshot(screenshotId?: string) {
    try {
      closeLatestModal();
      if (!screenshotId || !fullMarker) {
        return;
      }
      const patchedMarker = await notify(
        patchMarker(marker._id, { ...fullMarker, screenshotId })
      );
      fullMarker.screenshotFilename = patchedMarker.screenshotFilename;
      setMarkers((markers) => {
        const markersClone = [...markers];
        const index = markersClone.findIndex(
          (marker) => marker._id === patchedMarker._id
        );
        if (index === -1) {
          return markers;
        }
        markersClone[index] = patchedMarker;
        return markersClone;
      });
    } catch (error) {
      writeError(error);
    }
  }

  async function handleDelete() {
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

  const title = marker.chestType
    ? `${marker.chestType} Chest T${marker.tier}`
    : marker.name
    ? `${marker.name} (${filterItem?.title})`
    : filterItem?.title;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <img className={styles.icon} src={filterItem?.iconUrl} alt="" />
        <h2>{title}</h2>
      </header>
      <main className={styles.main}>
        {['boss', 'bossElite'].includes(marker.type) && (
          <Loot name={marker.name!} className={styles.loot} />
        )}
        <div className={styles.grow}>
          <div className={styles.comments}>
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
            {!loading && comments?.length === 0 && (
              <div className={styles.empty}>
                Be the first to write a comment
              </div>
            )}
          </div>
          {loading && <Loading />}
          <AddComment markerId={marker._id} onAdd={refresh} />
        </div>
      </main>
      <aside className={styles.more}>
        <h3>Actions</h3>
        <HideMarkerInput markerId={marker._id} onHide={closeLatestModal} />
        <button
          className={styles.button}
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
        </button>
        {account &&
          (account.isModerator || account.steamId === fullMarker?.userId) && (
            <>
              <button className={styles.button} onClick={onEdit}>
                ✍ Edit marker
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  addModal({
                    title: 'Do you really want to delete this marker?',
                    children: <Confirm onConfirm={handleDelete} />,
                    fitContent: true,
                  });
                }}
              >
                💀 Remove invalid marker 💀
              </button>
            </>
          )}
        <h3>Screenshot</h3>
        {fullMarker?.screenshotFilename ? (
          <a
            href={getScreenshotUrl(fullMarker.screenshotFilename)}
            target="_blank"
          >
            <img
              className={styles.preview}
              src={
                fullMarker.screenshotFilename
                  ? getScreenshotUrl(fullMarker.screenshotFilename)
                  : '/icon.png'
              }
              alt=""
            />
          </a>
        ) : (
          <button
            onClick={() =>
              addModal({
                title: 'Add screenshot',
                children: (
                  <UploadScreenshot onUpload={handleUploadScreenshot} />
                ),
              })
            }
          >
            <img className={styles.preview} src={'/icon.png'} alt="" />
            Take a screenshot
          </button>
        )}
        <h3>Details</h3>
        {account?.isModerator && (
          <small className={styles.userSelect}>{marker._id}</small>
        )}
        {marker.level && <p>Level {marker.level}</p>}
        {fullMarker?.description && (
          <Markdown>{fullMarker.description}</Markdown>
        )}
        {marker.position && <Coordinates position={marker.position} />}
        <small>
          Added {fullMarker && toTimeAgo(new Date(fullMarker.createdAt))}
        </small>
        {fullMarker?.username && <Credit username={fullMarker.username} />}
      </aside>
    </section>
  );
}

export default MarkerDetails;
