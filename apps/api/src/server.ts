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
import {
  getMarkersCollection,
  initMarkersCollection,
} from './lib/markers/collection.js';
import {
  getMarkerRoutesCollection,
  initMarkerRoutesCollection,
} from './lib/markerRoutes/collection.js';
import { initUsersCollection } from './lib/users/collection.js';
import authRouter from './lib/auth/router.js';
import commentsRouter from './lib/comments/router.js';
import markersRouter, {
  lastMarkers,
  refreshMarkers,
} from './lib/markers/router.js';
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
import searchRouter from './lib/search/router.js';
import { initItemsCollection } from './lib/items/collection.js';
import itemsRouter from './lib/items/router.js';
import supportersRouter from './lib/supporters/router.js';
import { initSupportersCollection } from './lib/supporters/collection.js';
import { initInfluencesCollection } from './lib/influences/collection.js';
import influencesRouter from './lib/influences/router.js';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';
import { getNodeMeta, getRouteMeta } from 'static';

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

// Tell express that it's behind a reverse-proxy
app.set('trust proxy', true);

// Redirects www. traffic
app.use((req, res, next) => {
  if (req.headers.host?.slice(0, 4) === 'www.') {
    const newHost = req.headers.host.slice(4);
    return res.redirect(308, req.protocol + '://' + newHost + req.originalUrl);
  }
  next();
});

async function runServer() {
  if (NO_SOCKET !== 'true') {
    initSocket(server);
    app.use('/api/live', liveRouter);
    console.log('Socket listening');
  }

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
    app.use('/api/search', searchRouter);
    app.use('/api/items', itemsRouter);
    app.use('/api/supporters', supportersRouter);
    app.use('/api/influences', influencesRouter);

    // Static screenshots folder
    app.use(
      '/screenshots',
      express.static(SCREENSHOTS_PATH!, {
        immutable: true,
        maxAge: '1w',
      })
    );

    app.get('/ads.txt', (_request, response) => {
      response.redirect(301, 'https://api.nitropay.com/v1/ads-1042.txt');
    });

    // Serve webversion (only on production)
    app.use(
      express.static(path.join(__dirname, '../../www/dist'), {
        immutable: true,
        maxAge: '1w',
      })
    );

    // Static assets folder
    app.use(
      '/assets',
      express.static(path.join(__dirname, '../public'), {
        immutable: true,
        maxAge: '1w',
      })
    );
    app.use('/assets', (_req, res) => {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('Content-Type', 'image/gif');
      res.send(
        'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      );
    });

    app.get('/robots.txt', (_req, res) => {
      const robotText = `
      User-agent: Googlebot
      Disallow: /nogooglebot/
  
      User-agent: *
      Allow: /
  
      Sitemap: https://aeternum-map.gg/sitemap.xml
      `;

      return res.send(robotText);
    });

    app.get('/sitemap.xml', (_req, res) => {
      const urls: string[] = [];
      lastMarkers.forEach((marker) => {
        urls.push(
          `<url><loc>https://aeternum-map.gg/nodes/${marker._id.toString()}</loc></url>`
        );
      });

      const content = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
        ''
      )}</urlset>`;

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('xml-version', '1.0');
      res.setHeader('encoding', 'UTF-8');
      res.send(content);
    });

    const productionHTML = fs.readFile(
      path.join(__dirname, '../../www/dist/index.html')
    );
    app.get('/nodes/:id', async (req, res) => {
      const id = req.params.id;
      const node = await getMarkersCollection().findOne({
        _id: new ObjectId(id),
      });
      if (!node) {
        res
          .status(404)
          .sendFile(path.join(__dirname, '../../www/dist/index.html'));
        return;
      }

      const { title, description } = getNodeMeta({
        name: node.name,
        type: node.type,
        position: node.position.map(Number) as [number, number, number],
        map: node.map,
      });
      const imageTag =
        node.screenshotFilename &&
        `https://aeternum-map.gg/screenshots/${node.screenshotFilename}`;
      const html = await (await productionHTML).toString().replace(
        '<!-- META -->',
        `<title>${title}</title>
<meta name="description" content="${description}"/>

<meta property="og:type" content="website">
<meta property="og:url" content="https://aeternum-map.gg/nodes/${id}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${imageTag ? `<meta property="og:image" content="${imageTag}">` : ''}

<meta property="twitter:card" content="${
          imageTag ? 'summary_large_image' : 'summary'
        }">
<meta property="twitter:url" content="https://aeternum-map.gg/nodes/${id}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
${imageTag ? `<meta property="twitter:image" content="${imageTag}">` : ''}
`
      );
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.send(html);
    });
    app.get('/routes/:id', async (req, res) => {
      const id = req.params.id;
      const route = await getMarkerRoutesCollection().findOne({
        _id: new ObjectId(id),
      });
      if (!route) {
        res
          .status(404)
          .sendFile(path.join(__dirname, '../../www/dist/index.html'));
        return;
      }

      const { title, description } = getRouteMeta(route);
      const html = await (await productionHTML).toString().replace(
        '<!-- META -->',
        `<title>${title}</title>
<meta name="description" content="${description}"/>

<meta property="og:type" content="website">
<meta property="og:url" content="https://aeternum-map.gg/routes/${id}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">

<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://aeternum-map.gg/routes/${id}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
`
      );
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.send(html);
    });

    // All other requests are answered with a 404
    app.all('*', (_req, res) => {
      res.sendFile(path.join(__dirname, '../../www/dist/index.html'));
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
      initItemsCollection(),
      initSupportersCollection(),
      initInfluencesCollection(),
    ]);
    console.log('Collection initialized');

    await refreshMarkers();
    console.log('Markers refreshed');
  }

  // Error handling middleware: https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).send(err.message);
  });

  // All other requests are answered with a 404
  app.all('*', (_req, res) => {
    res.status(404).send('🙈 Not found');
  });

  server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

runServer();
