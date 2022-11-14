import './globals.css';
import { waitForOverwolf } from 'ui/utils/overwolf';
import { createRoot } from 'react-dom/client';
import { StrictMode, useRef } from 'react';
import { closeCurrentWindow, dragMoveWindow } from 'ui/utils/windows';
import { ActionIcon, Box, Group, MantineProvider } from '@mantine/core';
import {
  addInfluenceScreenshot,
  getImageData,
  getInfluenceImageData,
  takeInfluenceScreenshot,
} from './utils/media';
import { IconHandMove, IconScreenshot, IconX } from '@tabler/icons';

const root = createRoot(document.querySelector('#root')!);

const Influences = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleScreenshot = async () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = await takeInfluenceScreenshot();
    canvasRef.current.width = canvas.width;
    canvasRef.current.height = canvas.height;
    const imageData = getImageData(canvas);
    const influenceImageData = getInfluenceImageData(imageData);
    const context = canvasRef.current.getContext('2d')!;
    context.putImageData(influenceImageData, 0, 0);
    // const array2d = to2d(influenceImageData);
    // overwolf.utils.placeOnClipboard(array2d);
  };

  return (
    <Box
      // onMouseDown={dragMoveWindow}
      sx={{
        width: '100vw',
        height: '100vh',
        // opacity: 0.8,
        backgroundRepeat: 'no-repeat',
        background: 'url(/influences.webp)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        position: 'relative',
      }}
    >
      <Group spacing={0}>
        <ActionIcon onMouseDown={dragMoveWindow} variant="default">
          <IconHandMove />
        </ActionIcon>
        <ActionIcon onClick={handleScreenshot} variant="default" color="dark">
          <IconScreenshot />
        </ActionIcon>
        <ActionIcon onClick={closeCurrentWindow} variant="default" color="dark">
          <IconX />
        </ActionIcon>
      </Group>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
    </Box>
  );
};

waitForOverwolf().then(() =>
  root.render(
    <StrictMode>
      <MantineProvider
        theme={{
          colorScheme: 'dark',
        }}
      >
        <Influences />
      </MantineProvider>
    </StrictMode>
  )
);
