import './globals.css';
import { waitForOverwolf } from 'ui/utils/overwolf';
import { createRoot } from 'react-dom/client';
import { StrictMode, useRef, useState } from 'react';
import { closeCurrentWindow, dragMoveWindow } from 'ui/utils/windows';
import { ActionIcon, Box, Group, MantineProvider } from '@mantine/core';
import { getImageData, toBlob } from './utils/media';
import type { Influence } from './utils/influence';
import {
  uploadInfluence,
  getInfluence,
  regions,
  takeInfluenceScreenshot,
} from './utils/influence';
import { IconHandMove, IconScreenshot, IconUpload, IconX } from '@tabler/icons';

const root = createRoot(document.querySelector('#root')!);

const Influences = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [influence, setInfluence] = useState<Influence | null>(null);

  const handleScreenshot = async () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = await takeInfluenceScreenshot();
    canvasRef.current.width = canvas.width;
    canvasRef.current.height = canvas.height;
    const imageData = getImageData(canvas);
    const influence = getInfluence(imageData);
    const context = canvasRef.current.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.shadowColor = 'black';
    context.shadowBlur = 5;
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.fillStyle = 'white';
    influence.forEach(({ regionName, factionName }) => {
      const region = regions.find((region) => region.name === regionName);
      if (region) {
        context.fillText(factionName, region.center[0], region.center[1]);
      }
    });
    setInfluence(influence);
    const blob = await toBlob(canvas);
    setBlob(blob);
  };

  return (
    <Box
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
      <Group spacing="xs">
        <ActionIcon onClick={handleScreenshot} variant="default">
          <IconScreenshot />
        </ActionIcon>
        <ActionIcon
          disabled={!blob}
          onClick={() =>
            blob &&
            influence &&
            uploadInfluence(blob, influence).then(closeCurrentWindow)
          }
          variant="default"
        >
          <IconUpload />
        </ActionIcon>
        <ActionIcon onMouseDown={dragMoveWindow} variant="default">
          <IconHandMove />
        </ActionIcon>
        <ActionIcon onClick={closeCurrentWindow} variant="default">
          <IconX />
        </ActionIcon>
      </Group>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
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
