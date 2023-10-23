import { FormData } from 'formdata-node';
import type { Response } from 'node-fetch';
import fetch from 'node-fetch';
import { findMapDetails, mapIsAeternumMap } from 'static';
import {
  DISCORD_PRIVATE_WEBHOOK_URL,
  DISCORD_PUBLIC_WEBHOOK_URL,
} from './env.js';

const MAX_DISCORD_MESSAGE_LENGTH = 2000;
export const postToDiscord = (
  content: string,
  isPublic = true,
  realm?: string
): Promise<Response> => {
  const webhookURL = isPublic
    ? DISCORD_PUBLIC_WEBHOOK_URL
    : DISCORD_PRIVATE_WEBHOOK_URL;
  let message = content.substring(0, MAX_DISCORD_MESSAGE_LENGTH);
  if (realm) {
    message += `\nRealm: ${realm.toUpperCase()}`;
  }

  return fetch(webhookURL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'BottyMcBotface',
      content: message,
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

export const uploadToDiscord = (
  blobs: Blob[],
  message: string,
  webhookUrl: string
) => {
  const formData = new FormData();
  blobs.forEach((blob, index) => {
    formData.append(`files[${index}]`, blob, `influences${index + 1}.webp`);
  });
  formData.append(
    'payload_json',
    JSON.stringify({
      username: 'influence.th.gl',
      avatar_url: 'https://aeternum-map.gg/icon.png',
      content: message,
    })
  );
  return fetch(webhookUrl, {
    method: 'POST',
    // @ts-ignore (https://github.com/octet-stream/form-data/issues/57)
    body: formData,
  });
};
