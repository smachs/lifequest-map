import fetch from 'isomorphic-fetch';
import { DISCORD_WEBHOOK_URL } from './env';

export function postToDiscord(
  content: string,
  embeds?: { title: string; description: string; image?: string }[]
): Promise<Response> {
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
