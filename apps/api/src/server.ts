import {
  PORT,
  MONGODB_URI,
  SCREENSHOTS_PATH,
  STEAM_API_KEY,
  SESSION_SECRET,
  VITE_API_ENDPOINT,
  NO_API,
  NO_SOCKET,
} from './lib/env.js';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectToMongoDb } from './lib/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { initCommentsCollection } from './lib/comments/collection.js';
import { initMarkersCollection } from './lib/markers/collection.js';
import { initMarkerRoutesCollection } from './lib/markerRoutes/collection.js';
import { initUsersCollection } from './lib/users/collection.js';
import authRouter from './lib/auth/router.js';
import commentsRouter from './lib/comments/router.js';
import markersRouter, { refreshMarkers } from './lib/markers/router.js';
import markerRoutesRouter from './lib/markerRoutes/router.js';
import usersRouter from './lib/users/router.js';
import screenshotsRouter from './lib/screenshots/router.js';
import compression from 'compression';
import { initScreenshotsCollection } from './lib/screenshots/collection.js';
import session from 'express-session';
import passport from 'passport';
// @ts-ignore
import SteamStrategy from 'passport-steam';
import { readAccount } from './lib/auth/middlewares.js';
import { initSocket } from './lib/live/socket.js';
import { initAccountsCollection } from './lib/auth/collection.js';
import liveRouter from './lib/live/router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (typeof PORT !== 'string') {
  throw new Error('PORT is not set');
}

const app = express();
const server = http.createServer(app);

// Middleware to set CORS headers
app.use(cors());

// Disable X-Powered-By header
app.disable('x-powered-by');

// Middleware for gzip compression
app.use(compression());

// Middleware that parses json and looks at requests where the Content-Type header matches the type option.
app.use(express.json());

async function runServer() {
  if (NO_API !== 'true') {
    app.use(
      session({
        secret: SESSION_SECRET!,
        name: 'sessionId',
        resave: true,
        saveUninitialized: true,
      })
    );

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((userSerialized: Express.User, done) => {
      done(null, userSerialized);
    });

    // Strategies in passport require a `validate` function, which accept
    // credentials (in this case, an OpenID identifier and profile), and invoke a
    // callback with a user object.
    const strategy = new SteamStrategy(
      {
        returnURL: `${VITE_API_ENDPOINT}/api/auth/steam/return`,
        realm: VITE_API_ENDPOINT,
        apiKey: STEAM_API_KEY,
      },
      (
        identifier: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile: any,
        done: (err: unknown, user?: Express.User | false | null) => void
      ) => {
        process.nextTick(() => {
          const steamIdRegex =
            /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;
          const steamId = steamIdRegex.exec(identifier)![1];
          done(null, { ...profile, steamId });
        });
      }
    );

    passport.use(strategy);

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(readAccount);

    // Serve API requests from the router
    app.use('/api/auth', authRouter);
    app.use('/api/comments', commentsRouter);
    app.use('/api/markers', markersRouter);
    app.use('/api/marker-routes', markerRoutesRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/screenshots', screenshotsRouter);

    // Static screenshots folder
    app.use('/screenshots', express.static(SCREENSHOTS_PATH!));

    app.get('/ads.txt', (_request, response) => {
      response.redirect(301, 'https://api.nitropay.com/v1/ads-1042.txt');
    });

    // Serve webversion (only on production)
    app.use(express.static(path.join(__dirname, '../../www/dist')));

    // Static assets folder
    app.use(
      '/assets',
      express.static(path.join(__dirname, '../public'), {
        immutable: true,
        maxAge: '1d',
        fallthrough: true,
      })
    );
    app.use('/assets', (_req, res) => {
      res.redirect('/assets/map/empty.webp');
    });

    await connectToMongoDb(MONGODB_URI!);

    console.log('Connected to MongoDB');
    await Promise.all([
      initAccountsCollection(),
      initCommentsCollection(),
      initMarkersCollection(),
      initMarkerRoutesCollection(),
      initUsersCollection(),
      initScreenshotsCollection(),
    ]);

    await refreshMarkers();
  }

  if (NO_SOCKET !== 'true') {
    initSocket(server);
    app.use('/api/live', liveRouter);
    console.log('Socket listening');
  }

  // All other requests are answered with a 404
  app.all('*', (_req, res) => {
    res.status(404).send('🙈 Not found');
  });

  server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

runServer();
