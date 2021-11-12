import type { MarkerBasic } from '../../contexts/MarkersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import useMarker from './useMarker';
import Loading from '../Loading/Loading';
import { mapFilters } from '../MapFilter/mapFilters';
import styles from './MarkerDetails.module.css';
import Markdown from 'markdown-to-jsx';
import HideMarkerInput from './HideMarkerInput';
import { useModal } from '../../contexts/ModalContext';
import UploadScreenshot from '../AddResources/UploadScreenshot';
import { useAccount } from '../../contexts/UserContext';
import Credit from './Credit';
import { writeError } from '../../utils/logs';
import { deleteMarker, patchMarker } from './api';
import { notify } from '../../utils/notifications';
import Confirm from '../Confirm/Confirm';

type MarkerDetailsProps = {
  marker: MarkerBasic;
};

function MarkerDetails({ marker }: MarkerDetailsProps): JSX.Element {
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
  const { refresh: refreshMarkers } = useMarkers();
  const { account } = useAccount();

  async function handleUploadScreenshot(screenshotId?: string) {
    try {
      closeLatestModal();
      if (!screenshotId || !fullMarker) {
        return;
      }
      const screenshotFilename = await notify(
        patchMarker(marker._id, screenshotId)
      );
      fullMarker.screenshotFilename = screenshotFilename;
      refreshMarkers();
    } catch (error) {
      writeError(error);
    }
  }

  async function handleDelete() {
    try {
      await notify(deleteMarker(marker._id), {
        success: 'Marker deleted 👌',
      });
      refreshMarkers();
      closeLatestModal();
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <img className={styles.icon} src={filterItem?.iconUrl} alt="" />
        <h2>
          {marker.name
            ? `${marker.name} (${filterItem?.title})`
            : filterItem?.title}
        </h2>
      </header>
      <main className={styles.main}>
        <div className={styles.comments}>
          {comments?.map((comment) => (
            <Comment
              key={comment._id}
              id={comment._id}
              username={comment.username}
              message={comment.message}
              createdAt={comment.createdAt}
              removable={Boolean(
                account &&
                  (account.isModerator || account.steamId === comment.userId)
              )}
              onRemove={() => refresh().then(refreshMarkers)}
            />
          ))}
          {!loading && comments?.length === 0 && (
            <div className={styles.empty}>Be the first to write a comment</div>
          )}
        </div>
        {loading && <Loading />}
        <AddComment markerId={marker._id} onAdd={refresh} />
      </main>
      <aside className={styles.more}>
        <h3>Actions</h3>
        <HideMarkerInput markerId={marker._id} />
        {account &&
          (account.isModerator || account.steamId === fullMarker?.userId) && (
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
        {marker.level && <p>Level {marker.level}</p>}
        {fullMarker?.description && (
          <Markdown>{fullMarker.description}</Markdown>
        )}
        {marker.position && <p>[{marker.position.join(', ')}]</p>}
        <small>
          Added {fullMarker && toTimeAgo(new Date(fullMarker.createdAt))}
        </small>
        {fullMarker?.username && <Credit username={fullMarker.username} />}
      </aside>
    </section>
  );
}

export default MarkerDetails;
