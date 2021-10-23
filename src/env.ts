import dotenv from 'dotenv';
dotenv.config();

if (typeof process.env.PORT !== 'string') {
  throw new Error('PORT is not set');
}
if (typeof process.env.MONGODB_URI !== 'string') {
  throw new Error('MONGODB_URI is not set');
}
if (typeof process.env.SCREENSHOTS_PATH !== 'string') {
  throw new Error('SCREENSHOTS_PATH environment variable is not set');
}

export const { PORT, MONGODB_URI, SCREENSHOTS_PATH } = process.env;
