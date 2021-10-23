import { toTimeAgo } from '../../utils/dates';
import styles from './Comment.module.css';
import { fetchJSON } from '../../utils/api';
import { writeError } from '../../utils/logs';
import DeleteButton from '../DeleteButton/DeleteButton';
import Markdown from '../Markdown/Markdown';

type CommentProps = {
  id: string;
  userId?: string;
  username: string;
  createdAt: Date;
  message: string;
  removable: boolean;
  onRemove: () => void;
};

function Comment({
  id,
  userId,
  username,
  createdAt,
  message,
  removable,
  onRemove,
}: CommentProps): JSX.Element {
  async function handleRemove(): Promise<void> {
    try {
      await fetchJSON(`/api/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });
      onRemove();
    } catch (error) {
      writeError(error);
    }
  }

  return (
    <article className={styles.container}>
      <p className={styles.name}>{username}</p>
      <small className={styles.createdAt}>{toTimeAgo(createdAt)}</small>
      <div className={styles.message}>
        <Markdown>{message}</Markdown>
      </div>
      {removable && <DeleteButton onClick={handleRemove} />}
    </article>
  );
}

export default Comment;
