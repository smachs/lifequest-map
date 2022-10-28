import { postMarkerRoute } from './api';
import { useState } from 'react';
import { writeError } from '../../utils/logs';
import { useAccount } from '../../contexts/UserContext';
import { notify } from '../../utils/notifications';
import { Button, Modal, Stack, TextInput } from '@mantine/core';
import type { MarkerRouteItem } from './MarkerRoutes';
import { IconArrowFork } from '@tabler/icons';

type ForkRouteProps = {
  markerRoute: MarkerRouteItem;
  onFork: (markerRoute: MarkerRouteItem) => void;
};
function ForkRoute({ markerRoute, onFork }: ForkRouteProps): JSX.Element {
  const { account } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  async function handleFork() {
    try {
      setLoading(true);
      const newMarkerRoute = {
        name: name,
        isPublic: false,
        positions: markerRoute.positions,
        markersByType: markerRoute.markersByType,
        map: markerRoute.map,
        origin: markerRoute._id,
      };

      const forkedMarkerRoute = await notify(postMarkerRoute(newMarkerRoute), {
        success: 'Fork added 👌',
      });

      onFork(forkedMarkerRoute);
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
        title="Do you want to fork this route?"
      >
        <Stack>
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            label="Please select a name"
            required
          />
          <Button
            onClick={handleFork}
            color="green"
            fullWidth
            loading={loading}
            disabled={name.length === 0}
          >
            Fork route
          </Button>
        </Stack>
      </Modal>
      <Button
        color="indigo"
        leftIcon={<IconArrowFork />}
        onClick={() => setShowModal(true)}
        disabled={!account}
      >
        Fork this route ({markerRoute.forks || 0} times)
      </Button>
    </>
  );
}

export default ForkRoute;
