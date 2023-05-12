import { MantineProvider, Modal } from '@mantine/core';
import { Suspense, lazy } from 'react';
const FAQ = lazy(() => import('./FAQ'));

type FAQModalProps = {
  opened: boolean;
  onClose: () => void;
};
const FAQModal = ({ opened, onClose }: FAQModalProps) => {
  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
    >
      <Modal centered opened={opened} onClose={onClose} title="FAQ" fullScreen>
        <Suspense>
          <FAQ />
        </Suspense>
      </Modal>
    </MantineProvider>
  );
};

export default FAQModal;
