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
import ResizeBorder from './components/ResizeBorder/ResizeBorder';
import './globals.css';
import type { Influence } from './utils/influence';
import {
  INFLUENCE_SIZE,
  factions,
  getInfluence,
  regions,
  takeInfluenceScreenshot,
  uploadInfluence,
} from './utils/influence';
import { getImageData, loadImage, toBlob } from './utils/media';
import useCenterWindow from './utils/useCenterWindow';
import { closeCurrentWindow, getCurrentWindow } from './utils/windows';

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
      const currentWindow = await getCurrentWindow();
      canvasRef.current.width = currentWindow.width;
      canvasRef.current.height = currentWindow.height;

      const imageData = getImageData(canvas);
      const influence = getInfluence(imageData);
      const context = canvasRef.current.getContext('2d')!;
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const images: {
        [key: string]: HTMLImageElement;
      } = {
        covenant: await loadImage('/covenant.webp'),
        marauder: await loadImage('/marauder.webp'),
        syndicate: await loadImage('/syndicate.webp'),
      };

      const scaleWidth = INFLUENCE_SIZE[0] / canvasRef.current.width;
      const scaleHeight = INFLUENCE_SIZE[1] / canvasRef.current.height;
      influence.forEach(({ regionName, factionName }) => {
        const region = regions.find((region) => region.name === regionName);
        const faction = factions.find(
          (faction) => faction.name === factionName
        );
        const image = images[factionName.toLowerCase()];

        if (region && faction && image) {
          context.drawImage(
            image,
            region.center[0] / scaleWidth,
            region.center[1] / scaleHeight
          );
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
        backgroundImage: 'url(/influences.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, border: '4px solid #000' }} />
      <Group spacing="xs" m="xs">
        <Tooltip label="Take screenshot">
          <ActionIcon
            onClick={handleScreenshot}
            variant={influence ? 'subtle' : 'filled'}
            color="cyan"
          >
            <IconScreenshot />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Upload influence data">
          <ActionIcon
            disabled={!influence || uploaded}
            onClick={handleUpload}
            variant="filled"
            loading={loading}
            color="cyan"
          >
            <IconUpload />
          </ActionIcon>
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
        <Notification color="teal" mt="xs" withCloseButton={false}>
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
      <ResizeBorder square />
    </Box>
  );
};

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
);
