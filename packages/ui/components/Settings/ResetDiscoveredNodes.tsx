import { Button, Modal } from '@mantine/core';
import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { notify } from '../../utils/notifications';
import { useUserStore } from '../../utils/userStore';
import { patchUser } from '../MarkerDetails/api';

const ResetDiscoveredNodes = () => {
  const { user, refreshUser } = useUserStore(
    (state) => ({ user: state.user, refreshUser: state.refreshUser }),
    shallow
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    try {
      if (!user) {
        return;
      }
      setLoading(true);
      await notify(patchUser(user.username, { hiddenMarkerIds: [] }), {
        success: 'Discovered nodes reset 👌',
      });
      await refreshUser();
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
        title={`Do you really want to reset all discovered nodes for ${user?.username}?`}
      >
        <Button onClick={handleReset} color="red" fullWidth loading={loading}>
          Reset nodes
        </Button>
      </Modal>
      <Button
        color="red"
        leftIcon={'💀'}
        onClick={() => setShowModal(true)}
        disabled={!user}
      >
        Reset discovered nodes
      </Button>
    </>
  );
};

export default ResetDiscoveredNodes;
