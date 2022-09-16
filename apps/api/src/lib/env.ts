import dotenv from 'dotenv';
dotenv.config();

if (typeof process.env.PORT !== 'string') {
  throw new Error('PORT is not set');
}
if (process.env.NO_API !== 'true') {
  if (typeof process.env.MONGODB_URI !== 'string') {
    throw new Error('MONGODB_URI is not set');
  }
  if (typeof process.env.SCREENSHOTS_PATH !== 'string') {
    throw new Error('SCREENSHOTS_PATH environment variable is not set');
  }
  if (typeof process.env.DISCORD_PUBLIC_WEBHOOK_URL !== 'string') {
    throw new Error('DISCORD_PUBLIC_WEBHOOK_URL is not set');
  }
  if (typeof process.env.DISCORD_PRIVATE_WEBHOOK_URL !== 'string') {
    throw new Error('DISCORD_PRIVATE_WEBHOOK_URL is not set');
  }
  if (typeof process.env.STEAM_API_KEY !== 'string') {
    throw new Error('STEAM_API_KEY is not set');
  }
  if (typeof process.env.SESSION_SECRET !== 'string') {
    throw new Error('SESSION_SECRET is not set');
  }
  if (typeof process.env.VITE_API_ENDPOINT !== 'string') {
    throw new Error('VITE_API_ENDPOINT is not set');
  }
}

export const {
  PORT,
  MONGODB_URI,
  SCREENSHOTS_PATH,
  DISCORD_PUBLIC_WEBHOOK_URL,
  DISCORD_PRIVATE_WEBHOOK_URL,
  STEAM_API_KEY,
  SESSION_SECRET,
  VITE_API_ENDPOINT,
  NODE_ENV,
  NO_API,
  NO_SOCKET,
} = process.env;
