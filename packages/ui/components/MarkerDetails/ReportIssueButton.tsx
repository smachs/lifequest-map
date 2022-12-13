import { Anchor, Button, Modal, Stack, Textarea } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { useUserStore } from '../../utils/userStore';
import { postComment } from '../AddComment/api';

type ReportIssueButtonProps = {
  markerId: string;
  onReport: () => Promise<void>;
};
const ReportIssueButton = ({ markerId, onReport }: ReportIssueButtonProps) => {
  const account = useUserStore((state) => state.account);
  const [showModal, setShowModal] = useState(false);
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
      await notify(postComment(markerId, { message, isIssue: true }));
      setMessage('');
      queryClient.invalidateQueries(['markers']);
      await onReport();
    } catch (error) {
      writeError(error);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  return (
    <>
      <Modal
        zIndex={999999}
        centered
        opened={showModal}
        onClose={() => setShowModal(false)}
        title="Report an issue"
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <Textarea
              autoFocus
              label="What is wrong with this node?"
              placeholder="e.g. does not exist or has invalid description"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
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
            <Button
              type="submit"
              color="yellow"
              fullWidth
              disabled={!message.trim()}
              loading={loading}
            >
              Report issue
            </Button>
          </Stack>
        </form>
      </Modal>
      <Button
        color="yellow"
        leftIcon={'⚠️'}
        onClick={() => setShowModal(true)}
        disabled={!account}
      >
        {account ? 'Report an issue' : 'Login to report an issue'}
      </Button>
    </>
  );
};

export default ReportIssueButton;
