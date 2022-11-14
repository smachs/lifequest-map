import type { Response } from 'node-fetch';
import fetch from 'node-fetch';
import { findMapDetails, mapIsAeternumMap } from 'static';
import {
  DISCORD_PUBLIC_WEBHOOK_URL,
  DISCORD_PRIVATE_WEBHOOK_URL,
} from './env.js';
import FormData from 'form-data';

const MAX_DISCORD_MESSAGE_LENGTH = 2000;
export const postToDiscord = (
  content: string,
  isPublic = true
): Promise<Response> => {
  const webhookURL = isPublic
    ? DISCORD_PUBLIC_WEBHOOK_URL
    : DISCORD_PRIVATE_WEBHOOK_URL;
  return fetch(webhookURL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'BottyMcBotface',
      content: content.substring(0, MAX_DISCORD_MESSAGE_LENGTH),
    }),
  });
};

export const getURL = (path: 'routes' | 'nodes', id: string, map?: string) => {
  let url = 'https://aeternum-map.gg/';
  if (map && !mapIsAeternumMap(map)) {
    const mapDetails = findMapDetails(map);
    if (mapDetails) {
      url += `${mapDetails.title}/`;
    }
  }
  url += `${path}/${id}`;
  return url;
};

export const getMarkerURL = (id: string, map?: string) => {
  return getURL('nodes', id, map);
};

export const getMarkerRoutesURL = (id: string, map?: string) => {
  return getURL('routes', id, map);
};

export const uploadToDiscord = (buffer: Buffer, message: string) => {
  const formData = new FormData();

  // @ts-ignore Buffer instead of Blob is fine
  formData.append('files[0]', buffer, { filename: 'screenshot.webp' });
  formData.append(
    'payload_json',
    JSON.stringify({
      username: 'AeternumMap',
      content: message,
    })
  );
  return fetch(
    'https://discord.com/api/webhooks/1041621984896892939/HKaFtMurX4nWgnphfcayBjXgLDzKOrpPwSZleJ4tZpcM8syIgZnoWe1wNpf0kLjeJjZ9',
    {
      method: 'POST',
      body: formData,
    }
  );
};
