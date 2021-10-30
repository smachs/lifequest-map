import {
  PORT,
  MONGODB_URI,
  SCREENSHOTS_PATH,
  STEAM_API_KEY,
  SESSION_SECRET,
  VITE_API_ENDPOINT,
} from './lib/env';
import express from 'express';
import cors from 'cors';
import { connectToMongoDb } from './lib/db';
import path from 'path';
import { initCommentsCollection } from './lib/comments/collection';
import { initMarkersCollection } from './lib/markers/collection';
import { initMarkerRoutesCollection } from './lib/markerRoutes/collection';
import { initUsersCollection } from './lib/users/collection';
import authRouter from './lib/auth/router';
import commentsRouter from './lib/comments/router';
import markersRouter from './lib/markers/router';
import markerRoutesRouter from './lib/markerRoutes/router';
import usersRouter from './lib/users/router';
import screenshotsRouter from './lib/screenshots/router';
import compression from 'compression';
import { initScreenshotsCollection } from './lib/screenshots/collection';
import session from 'express-session';
import passport from 'passport';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SteamStrategy from 'passport-steam';
import { readAccount } from './lib/auth/middlewares';

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

app.use(
  session({
    secret: SESSION_SECRET,
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
app.use('/screenshots', express.static(SCREENSHOTS_PATH));

// Static assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// All other requests are answered with a 404
app.all('*', (_req, res) => {
  res.status(404).send('🙈 Not found');
});

connectToMongoDb(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  await Promise.all([
    initCommentsCollection(),
    initMarkersCollection(),
    initMarkerRoutesCollection(),
    initUsersCollection(),
    initScreenshotsCollection(),
  ]);

  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
});
