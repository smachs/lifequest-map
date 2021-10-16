import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { useUser } from '../../contexts/UserContext';
import { fetchJSON } from '../../utils/api';
import styles from './AddComment.module.css';

type AddCommentProps = {
  markerId: string;
  onAdd: () => void;
};

function AddComment({ markerId, onAdd }: AddCommentProps): JSX.Element {
  const user = useUser();
  const [message, setMessage] = useState('');
  const { refresh: refreshMarkers } = useMarkers();

  async function handleSubmit(event?: FormEvent) {
    if (event) {
      event.preventDefault();
    }
    if (!user) {
      return;
    }
    if (!message.trim()) {
      return;
    }

    try {
      await fetchJSON(`/api/markers/${markerId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          message: message,
        }),
      });
      onAdd();
      setMessage('');
      refreshMarkers();
    } catch (error) {
      console.error(error);
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
          !user ? 'You need to login to add a comment' : 'Add a comment'
        }
        rows={1}
        disabled={!user}
      />
      <input
        type="submit"
        value="Send"
        disabled={message.trim().length === 0 || !user}
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
