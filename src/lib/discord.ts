import fetch from 'isomorphic-fetch';
import { mapFilters } from '../app/components/MapFilter/mapFilters';
import type { Marker, Comment, User } from '../types';

export function postToDiscord(
  content: string,
  embeds?: { title: string; description: string; image?: string }[]
): Promise<Response> {
  const { DISCORD_WEBHOOK_URL } = process.env;
  if (!DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL is not set');
  }

  return fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'BottyMcBotface',
      content,
      embeds,
    }),
  });
}

export async function sendToDiscord({
  marker,
  comment,
  user,
}: {
  marker?: Marker;
  comment?: Comment;
  user?: User;
}): Promise<void> {
  if (comment && marker) {
    const position = marker.position ? marker.position.join(', ') : 'unknown';
    await postToDiscord(
      `✍ ${comment.username} added a comment for ${marker.type} at [${position}]:\n${comment.message}`
    );
    return;
  }

  if (marker) {
    const { VITE_API_ENDPOINT } = process.env;
    if (!VITE_API_ENDPOINT) {
      throw new Error('VITE_API_ENDPOINT is not set');
    }

    const mapFilter = mapFilters.find((filter) => filter.type === marker.type);
    if (!mapFilter) {
      console.error(`Unknown type ${marker.type}`);
      return;
    }
    const position = marker.position
      ? marker.position.map((position) => position.value).join(', ')
      : 'unknown';
    await postToDiscord(
      `📌 ${mapFilter.title} was added by ${marker.username} at [${position}]`
    );
    return;
  }
  if (user) {
    postToDiscord(`🤘 ${user.username} is using Aeternum Map`);
    return;
  }
}
