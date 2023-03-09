import { Button, Modal } from '@mantine/core';
import { useState } from 'react';
import { notify } from '../../utils/notifications';
import { useUserStore } from '../../utils/userStore';
import { deleteMarker } from './api';

type DeleteNodeProps = {
  markerId: string;
  onDelete: () => void;
};
function DeleteNode({ markerId, onDelete }: DeleteNodeProps): JSX.Element {
  const account = useUserStore((state) => state.account);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await notify(deleteMarker(markerId), {
        success: 'Node deleted 👌',
      });
      onDelete();
    } catch (error) {
      console.error(error);
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
        title="Do you really want to delete this node?"
      >
        <Button onClick={handleDelete} color="red" fullWidth loading={loading}>
          Delete node
        </Button>
      </Modal>
      <Button
        color="red"
        leftIcon={'💀'}
        onClick={() => setShowModal(true)}
        disabled={!account}
      >
        Delete node
      </Button>
    </>
  );
}

export default DeleteNode;
