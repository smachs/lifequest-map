import { toTimeAgo } from '../../utils/dates';
import styles from './Comment.module.css';
import { writeError } from '../../utils/logs';
import DeleteButton from '../DeleteButton/DeleteButton';
import Markdown from '../Markdown/Markdown';
import { deleteComment } from './api';
import { notify } from '../../utils/notifications';

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
    if (!userId) {
      return;
    }
    try {
      await notify(deleteComment(id, userId));
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
