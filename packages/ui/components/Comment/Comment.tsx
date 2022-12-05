import { toTimeAgo } from '../../utils/dates';
import { writeError } from '../../utils/logs';
import Markdown from '../Markdown/Markdown';
import { deleteComment } from './api';
import { notify } from '../../utils/notifications';
import { ActionIcon, Button, Card, Group, Modal, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { useState } from 'react';

type CommentProps = {
  id: string;
  username: string;
  createdAt: Date;
  message: string;
  removable: boolean;
  isIssue?: boolean;
  onRemove: () => void;
};

function Comment({
  id,
  username,
  createdAt,
  message,
  removable,
  isIssue,
  onRemove,
}: CommentProps): JSX.Element {
  const [showDeletingModal, setShowDeletingModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    try {
      setIsDeleting(true);
      await notify(deleteComment(id));
      onRemove();
    } catch (error) {
      writeError(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <Modal
        zIndex={999999}
        centered
        opened={showDeletingModal}
        onClose={() => setShowDeletingModal(false)}
        title={`Do you really want to delete ${username}'s comment?`}
      >
        <Button
          color="red"
          onClick={handleDelete}
          fullWidth
          loading={isDeleting}
        >
          Delete comment
        </Button>
      </Modal>
      {isIssue && (
        <Text size="xs" style={{ color: '#ff5722', marginBottom: '0.5rem' }}>
          ⚠️ Reported issue ⚠️
        </Text>
      )}
      <Group spacing="xs">
        <Text size="xs" weight={500}>
          {username}
        </Text>
        <Text size="xs" color="dimmed">
          {toTimeAgo(createdAt)}
        </Text>
        {removable && (
          <ActionIcon
            color="dark"
            onClick={() => setShowDeletingModal(true)}
            aria-label="Delete comment"
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
      <Text
        style={{ lineBreak: 'anywhere' }}
        sx={{
          img: {
            display: 'block',
            maxHeight: 100,
            maxWidth: '100%',
            margin: '0.5em 0',
          },
        }}
      >
        <Markdown>{message}</Markdown>
      </Text>
    </Card>
  );
}

export default Comment;
