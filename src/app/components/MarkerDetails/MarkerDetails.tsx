import type { Marker } from '../../contexts/MarkersContext';
import { useMarkers } from '../../contexts/MarkersContext';
import { fetchJSON, getScreenshotUrl } from '../../utils/api';
import { toTimeAgo } from '../../utils/dates';
import AddComment from '../AddComment/AddComment';
import Comment from '../Comment/Comment';
import useComments from '../Comment/useComments';
import Loading from '../Loading/Loading';
import { mapFilters } from '../MapFilter/mapFilters';
import styles from './MarkerDetails.module.css';
import Markdown from 'markdown-to-jsx';
import HideMarkerInput from './HideMarkerInput';
import { useModal } from '../../contexts/ModalContext';
import UploadScreenshot from '../AddResources/UploadScreenshot';
import { useUser } from '../../contexts/UserContext';
import Credit from './Credit';

type MarkerDetailsProps = {
  marker: Marker;
};

function MarkerDetails({ marker }: MarkerDetailsProps): JSX.Element {
  const { comments, loading, refresh } = useComments(marker._id);
  const filterItem = mapFilters.find(
    (mapFilter) => mapFilter.type === marker.type
  );
  const { addModal, closeLatestModal } = useModal();
  const { refresh: refreshMarkers } = useMarkers();
  const user = useUser();

  async function handleUploadScreenshot(
    screenshotFilename?: string | undefined
  ) {
    closeLatestModal();
    if (!screenshotFilename) {
      return;
    }
    await fetchJSON(`/api/markers/${marker._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenshotFilename,
      }),
    });
    marker.screenshotFilename = screenshotFilename;
    refreshMarkers();
  }

  async function handleDelete() {
    await fetchJSON(`/api/markers/${marker._id}`, {
      method: 'DELETE',
    });
    refreshMarkers();
    closeLatestModal();
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
              username={comment.username}
              message={comment.message}
              createdAt={comment.createdAt}
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
        {user?.username === 'loltrophyhunter' && (
          <button className={styles.button} onClick={handleDelete}>
            💀 Remove invalid marker 💀
          </button>
        )}
        <h3>Screenshot</h3>
        {marker.screenshotFilename ? (
          <a href={getScreenshotUrl(marker.screenshotFilename)} target="_blank">
            <img
              className={styles.preview}
              src={
                marker.screenshotFilename
                  ? getScreenshotUrl(marker.screenshotFilename)
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
        {marker.levelRange && <p>Level Range {marker.levelRange.join('-')}</p>}
        {marker.description && <Markdown>{marker.description}</Markdown>}
        {marker.position && <p>[{marker.position.join(', ')}]</p>}
        <small>Added {toTimeAgo(new Date(marker.createdAt))}</small>
        {marker.username && <Credit username={marker.username} />}
      </aside>
    </section>
  );
}

export default MarkerDetails;
