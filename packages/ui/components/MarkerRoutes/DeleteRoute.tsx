import { deleteMarkerRoute } from './api';
import { useState } from 'react';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { Button, Modal } from '@mantine/core';
import { useUserStore } from '../../utils/userStore';

type DeleteRouteProps = {
  routeId: string;
  onDelete: () => void;
};
function DeleteRoute({ routeId, onDelete }: DeleteRouteProps): JSX.Element {
  const account = useUserStore((state) => state.account);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await notify(deleteMarkerRoute(routeId), {
        success: 'Route deleted 👌',
      });
      onDelete();
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
        title="Do you really want to delete this route?"
      >
        <Button onClick={handleDelete} color="red" fullWidth loading={loading}>
          Delete route
        </Button>
      </Modal>
      <Button
        color="red"
        leftIcon={'💀'}
        onClick={() => setShowModal(true)}
        disabled={!account}
      >
        Delete route
      </Button>
    </>
  );
}

export default DeleteRoute;
