import { Dialog } from '@mantine/core';
import { Suspense, lazy } from 'react';
const Settings = lazy(() => import('./Settings'));

type SettingsDialogProps = {
  opened: boolean;
  onClose: () => void;
};
const SettingsDialog = ({ opened, onClose }: SettingsDialogProps) => {
  return (
    <Dialog
      opened={opened}
      withCloseButton
      onClose={onClose}
      position={{ top: 7, right: 7 }}
    >
      <Suspense>
        <Settings />
      </Suspense>
    </Dialog>
  );
};

export default SettingsDialog;
