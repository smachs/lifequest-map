import { Button, Dialog, Text } from '@mantine/core';
import { useRegisterSW } from 'virtual:pwa-register/react';

const intervalMS = 60 * 60 * 1000;

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update();
        }, intervalMS);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <>
      {needRefresh && (
        <Dialog
          opened
          withCloseButton
          onClose={close}
          position={{ top: 50, right: 7 }}
        >
          <Text size="sm" mb="xs" weight={500}>
            New version available
          </Text>
          <Button onClick={() => updateServiceWorker(true)}>Update now</Button>
        </Dialog>
      )}
    </>
  );
}

export default ReloadPrompt;
