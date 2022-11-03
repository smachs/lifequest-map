import { Anchor, Textarea } from '@mantine/core';
import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { useMarkers } from '../../contexts/MarkersContext';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { useUserStore } from '../../utils/userStore';
import { postComment } from './api';

type AddCommentProps = {
  markerId: string;
  onAdd: () => void;
};

function AddComment({ markerId, onAdd }: AddCommentProps): JSX.Element {
  const account = useUserStore((state) => state.account);
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
    <form onSubmit={handleSubmit}>
      <Textarea
        style={{ flex: 1 }}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={handleKeyPress}
        label="Your comment"
        placeholder={
          !account ? 'You need to login to add a comment' : 'Your comment'
        }
        minRows={1}
        maxRows={1}
        disabled={!account || loading}
        description={
          <>
            <Anchor
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_blank"
              rel="noreferrer"
            >
              Markdown
            </Anchor>{' '}
            is supported
          </>
        }
      />
    </form>
  );
}

export default AddComment;
