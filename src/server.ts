import { PORT, MONGODB_URI, SCREENSHOTS_PATH } from './lib/env';
import express from 'express';
import cors from 'cors';
import { connectToMongoDb } from './lib/db';
import path from 'path';
import { initCommentsCollection } from './lib/comments/collection';
import { initMarkersCollection } from './lib/markers/collection';
import { initMarkerRoutesCollection } from './lib/markerRoutes/collection';
import { initUsersCollection } from './lib/users/collection';
import commentsRouter from './lib/comments/router';
import markersRouter from './lib/markers/router';
import markerRoutesRouter from './lib/markerRoutes/router';
import usersRouter from './lib/users/router';
import screenshotsRouter from './lib/screenshots/router';
import compression from 'compression';

if (typeof PORT !== 'string') {
  throw new Error('PORT is not set');
}
if (typeof MONGODB_URI !== 'string') {
  throw new Error('MONGODB_URI is not set');
}
if (typeof SCREENSHOTS_PATH !== 'string') {
  throw new Error('SCREENSHOTS_PATH environment variable is not set');
}

const app = express();

// Middleware to set CORS headers
app.use(cors());

// Disable X-Powered-By header
app.disable('x-powered-by');

// Middleware for gzip compression
app.use(compression());

// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

// Serve API requests from the router
app.use('/api/comments', commentsRouter);
app.use('/api/markers', markersRouter);
app.use('/api/marker-routes', markerRoutesRouter);
app.use('/api/users', usersRouter);
app.use('/api/screenshots', screenshotsRouter);

// Static screenshots folder
app.use('/screenshots', express.static(SCREENSHOTS_PATH));

// Static assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// All other requests are answered with a 404
app.get('*', (_req, res) => {
  res.status(404).send('Not found');
});

connectToMongoDb(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  await Promise.all([
    initCommentsCollection(),
    initMarkersCollection(),
    initMarkerRoutesCollection(),
    initUsersCollection(),
  ]);

  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
});
