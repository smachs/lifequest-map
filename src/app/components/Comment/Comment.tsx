import { toTimeAgo } from '../../utils/dates';
import styles from './Comment.module.css';
import { writeError } from '../../utils/logs';
import DeleteButton from '../DeleteButton/DeleteButton';
import Markdown from '../Markdown/Markdown';
import { deleteComment } from './api';
import { notify } from '../../utils/notifications';

type CommentProps = {
  id: string;
  username: string;
  createdAt: Date;
  message: string;
  removable: boolean;
  onRemove: () => void;
};

function Comment({
  id,
  username,
  createdAt,
  message,
  removable,
  onRemove,
}: CommentProps): JSX.Element {
  async function handleRemove(): Promise<void> {
    try {
      await notify(deleteComment(id));
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
      <div className={styles.actions}>
        {removable && <DeleteButton onClick={handleRemove} />}
      </div>
    </article>
  );
}

export default Comment;
