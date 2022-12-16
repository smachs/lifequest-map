import { Anchor, Textarea } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { useUserStore } from '../../utils/userStore';
import { postMarkersComment, postRoutesComment } from './api';

type AddCommentProps = {
  markerId?: string;
  markerRouteId?: string;
  onAdd: () => void;
};

function AddComment({
  markerId,
  markerRouteId,
  onAdd,
}: AddCommentProps): JSX.Element {
  const account = useUserStore((state) => state.account);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

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
      if (markerId) {
        await notify(postMarkersComment(markerId, { message }));
        queryClient.invalidateQueries(['markers']);
      } else if (markerRouteId) {
        await notify(postRoutesComment(markerRouteId, { message }));
        queryClient.invalidateQueries(['routes']);
      }
      onAdd();
      setMessage('');
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
