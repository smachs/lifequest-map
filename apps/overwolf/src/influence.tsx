import {
  ActionIcon,
  Box,
  Group,
  MantineProvider,
  Notification,
  Tooltip,
} from '@mantine/core';
import { IconScreenshot, IconUpload, IconX } from '@tabler/icons-react';
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { waitForOverwolf } from 'ui/utils/overwolf';
import { closeCurrentWindow } from 'ui/utils/windows';
import './globals.css';
import type { Influence } from './utils/influence';
import {
  factions,
  getInfluence,
  regions,
  takeInfluenceScreenshot,
  uploadInfluence,
} from './utils/influence';
import { getImageData, loadImage, toBlob } from './utils/media';
import useCenterWindow from './utils/useCenterWindow';

const root = createRoot(document.querySelector('#root')!);

const Influences = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [influence, setInfluence] = useState<Influence | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useCenterWindow();

  const handleScreenshot = async () => {
    if (!canvasRef.current) {
      return;
    }
    try {
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
      const blob = await toBlob(canvas);
      setBlob(blob);
      setInfluence(influence);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not take screenshot'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!blob || !influence || uploaded) {
      return;
    }
    try {
      setErrorMessage('');
      setLoading(true);
      await uploadInfluence(blob, influence);
      setUploaded(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not upload data'
      );
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
        <Tooltip label="Take screenshot">
          <div>
            <ActionIcon
              onClick={handleScreenshot}
              variant="filled"
              disabled={!!influence}
              color="cyan"
            >
              <IconScreenshot />
            </ActionIcon>
          </div>
        </Tooltip>
        <Tooltip label="Upload influence data">
          <div>
            <ActionIcon
              disabled={!influence || uploaded}
              onClick={handleUpload}
              variant="filled"
              loading={loading}
              color="cyan"
            >
              <IconUpload />
            </ActionIcon>
          </div>
        </Tooltip>
        <Tooltip label="Close overlay">
          <ActionIcon
            onClick={closeCurrentWindow}
            variant="default"
            color={uploaded ? 'cyan' : 'gray'}
          >
            <IconX />
          </ActionIcon>
        </Tooltip>
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
      {uploaded && (
        <Notification color="teal" mt="xs" disallowClose>
          You are awesome 🤘
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
