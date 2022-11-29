import { useState } from 'react';
import { MantineProvider, ActionIcon, Tooltip } from '@mantine/core';
import { IconHelp } from '@tabler/icons';
import FAQModal from './FAQModal';

const FAQ = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
    >
      <FAQModal opened={showModal} onClose={() => setShowModal(false)} />
      <Tooltip label="FAQ">
        <ActionIcon
          variant="default"
          onClick={() => setShowModal(true)}
          radius="sm"
          size="xl"
        >
          <IconHelp />
        </ActionIcon>
      </Tooltip>
    </MantineProvider>
  );
};

export default FAQ;
