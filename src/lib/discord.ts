import fetch from 'isomorphic-fetch';
import { DISCORD_WEBHOOK_URL } from './env';

export function postToDiscord(
  content: string,
  webhookURL = DISCORD_WEBHOOK_URL
): Promise<Response> {
  return fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'BottyMcBotface',
      content,
    }),
  });
}
