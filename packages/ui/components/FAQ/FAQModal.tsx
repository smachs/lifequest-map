import { MantineProvider, Modal } from '@mantine/core';
import FAQ from './FAQ';

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
        <FAQ />
      </Modal>
    </MantineProvider>
  );
};

export default FAQModal;
