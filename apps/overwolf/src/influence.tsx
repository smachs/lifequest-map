import './globals.css';
import { waitForOverwolf } from 'ui/utils/overwolf';
import { createRoot } from 'react-dom/client';
import { StrictMode, useRef, useState } from 'react';
import { closeCurrentWindow } from 'ui/utils/windows';
import {
  ActionIcon,
  Box,
  Group,
  MantineProvider,
  Notification,
} from '@mantine/core';
import { getImageData, loadImage, toBlob } from './utils/media';
import type { Influence } from './utils/influence';
import { factions } from './utils/influence';
import {
  uploadInfluence,
  getInfluence,
  regions,
  takeInfluenceScreenshot,
} from './utils/influence';
import { IconScreenshot, IconUpload, IconX } from '@tabler/icons';
import useCenterWindow from './utils/useCenterWindow';

const root = createRoot(document.querySelector('#root')!);

const Influences = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [influence, setInfluence] = useState<Influence | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useCenterWindow();

  const handleScreenshot = async () => {
    if (!canvasRef.current) {
      return;
    }
    try {
      setLoading(true);
      setErrorMessage('');
      const canvas = await takeInfluenceScreenshot();
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      const imageData = getImageData(canvas);
      const influence = getInfluence(imageData);
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(0, 0, canvas.width, canvas.height);
      const frame = await loadImage('/influences.webp');
      context.drawImage(frame, 0, 0);
      context.font = '20px Arial';
      context.textAlign = 'center';
      context.shadowColor = 'black';
      context.shadowBlur = 5;
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 3;
      context.fillStyle = 'white';

      const images: {
        [key: string]: HTMLImageElement;
      } = {
        covenant: await loadImage('/covenant.webp'),
        marauder: await loadImage('/marauder.webp'),
        syndicate: await loadImage('/syndicate.webp'),
      };

      influence.forEach(({ regionName, factionName }) => {
        const region = regions.find((region) => region.name === regionName);
        const faction = factions.find(
          (faction) => faction.name === factionName
        );
        const image = images[factionName.toLowerCase()];

        if (region && faction && image) {
          context.drawImage(image, region.center[0], region.center[1]);
        }
      });
      setInfluence(influence);
      const blob = await toBlob(canvas);
      setBlob(blob);
      if (influence.length !== 15) {
        setErrorMessage('Could not detect influences');
      }
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundRepeat: 'no-repeat',
        background: 'url(/influences.webp)',
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Group spacing="xs">
        <ActionIcon onClick={handleScreenshot} variant="default">
          <IconScreenshot />
        </ActionIcon>
        <ActionIcon
          disabled={!blob || !!errorMessage}
          onClick={() =>
            blob &&
            influence &&
            uploadInfluence(blob, influence)
              .then(closeCurrentWindow)
              .catch((error) => {
                setErrorMessage((error as Error).message);
              })
          }
          variant="default"
          loading={loading}
        >
          <IconUpload />
        </ActionIcon>
        <ActionIcon onClick={closeCurrentWindow} variant="default">
          <IconX />
        </ActionIcon>
      </Group>
      {errorMessage && (
        <Notification
          onClose={() => setErrorMessage('')}
          icon={<IconX size={18} />}
          color="red"
          mt="xs"
        >
          {errorMessage}
        </Notification>
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
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
