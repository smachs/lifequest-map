import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { useAccount } from '../../contexts/UserContext';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import styles from './AddComment.module.css';
import { postComment } from './api';

type AddCommentProps = {
  markerId: string;
  onAdd: () => void;
};

function AddComment({ markerId, onAdd }: AddCommentProps): JSX.Element {
  const { account } = useAccount();
  const [message, setMessage] = useState('');
  const { refresh: refreshMarkers } = useMarkers();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event?: FormEvent) {
    if (event) {
      event.preventDefault();
    }
    if (!account) {
      return;
    }
    if (!message.trim()) {
      return;
    }

    try {
      setLoading(true);
      await notify(postComment(markerId, { message }));
      onAdd();
      setMessage('');
      refreshMarkers();
    } catch (error) {
      writeError(error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && event.shiftKey === false) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={
          !account ? 'You need to login to add a comment' : 'Add a comment'
        }
        rows={1}
        disabled={!account}
      />
      <input
        type="submit"
        value="Send"
        disabled={message.trim().length === 0 || !account || loading}
      />
      <small className={styles.hint}>
        <a
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
          rel="noreferrer"
        >
          Markdown
        </a>{' '}
        is supported
      </small>
    </form>
  );
}

export default AddComment;
