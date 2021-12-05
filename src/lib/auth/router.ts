import { Router } from 'express';
import passport from 'passport';
import type { UpdateFilter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { v4 as uuid, validate as validateUUID } from 'uuid';
import { postToDiscord } from '../discord';
import { getAccountCollection } from './collection';
import { ensureAuthenticated } from './middlewares';
import type { AccountDTO } from './types';
import { getMarkerRoutesCollection } from '../markerRoutes/collection';
import type { MarkerRouteDTO } from '../markerRoutes/types';

declare module 'express-session' {
  interface SessionData {
    sessionId: string;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      account?: AccountDTO;
    }
    interface User {
      steamId: string;
      displayName: string;
    }
  }
}

const authRouter = Router();

authRouter.get('/session', (_req, res) => {
  const sessionId = uuid();
  res.json(sessionId);
});

authRouter.get('/account', ensureAuthenticated, (req, res) => {
  const account = {
    ...req.account!,
    sessionId: req.account!.sessionIds[req.account!.sessionIds.length - 1],
  };
  res.json(account);
});

authRouter.get('/logout', ensureAuthenticated, async (req, res) => {
  const result = await getAccountCollection().updateOne(
    { steamId: req.account!.steamId },
    { $unset: { sessionId: true } }
  );
  if (!result.modifiedCount) {
    res.status(404).end(`No account found`);
    return;
  }
  res.status(200).json('Signed out');
});

authRouter.get(
  '/steam',
  (req, res, next) => {
    if (
      typeof req.query?.sessionId === 'string' &&
      validateUUID(req.query.sessionId)
    ) {
      req.session.sessionId = req.query.sessionId;
      next();
    } else {
      res.sendStatus(403);
    }
  },
  passport.authenticate('steam', { failureRedirect: '/' }),
  function (_req, res) {
    res.redirect('/');
  }
);

authRouter.get(
  '/steam/return',
  (req, res, next) => {
    if (
      typeof req.session?.sessionId === 'string' &&
      validateUUID(req.session.sessionId)
    ) {
      next();
    } else {
      res.sendStatus(403);
    }
  },
  passport.authenticate('steam', { failureRedirect: '/' }),
  async (req, res) => {
    if (!req.isAuthenticated()) {
      res.sendStatus(403);
      return;
    }
    try {
      const result = await getAccountCollection().findOneAndUpdate(
        { steamId: req.user.steamId },
        {
          $set: {
            name: req.user.displayName,
          },
          $push: {
            sessionIds: {
              $each: [req.session.sessionId!],
              $slice: -10,
            },
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
      if (!result.ok) {
        res
          .status(500)
          .send('Login failed. Please try again or visit Discord for support.');
        return;
      }
      res.send(`logged in successfully, you can close this window now`);
      postToDiscord(`🤘 ${req.user.displayName} is using Aeternum Map`, false);
    } catch (error) {
      console.error(
        `Login failed for ${req.user.displayName} (${req.user.steamId}) with ${req.session.sessionId}`
      );
      res
        .status(500)
        .send('Login failed. Please try again or visit Discord for support.');
    }
  }
);

authRouter.patch(
  '/favorite-routes/:routeId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const { routeId } = req.params;
      const { isFavorite } = req.body;

      if (!ObjectId.isValid(routeId) || typeof isFavorite !== 'boolean') {
        res.status(400).send('Invalid payload');
        return;
      }
      const routeObjectId = new ObjectId(routeId);

      let updateAccount: UpdateFilter<AccountDTO>;
      let updateRoute: UpdateFilter<MarkerRouteDTO>;
      if (isFavorite) {
        updateAccount = {
          $addToSet: {
            favoriteRouteIds: routeObjectId,
          },
        };
        updateRoute = {
          $inc: {
            favorites: 1,
          },
        };
      } else {
        updateAccount = {
          $pull: {
            favoriteRouteIds: routeObjectId,
          },
        };
        updateRoute = {
          $inc: {
            favorites: -1,
          },
        };
      }
      const result = await getAccountCollection().updateOne(
        { steamId: req.account!.steamId },
        updateAccount
      );
      if (!result.modifiedCount) {
        res.status(404).end('Account not changed');
        return;
      }
      await getMarkerRoutesCollection().updateOne(
        { _id: routeObjectId },
        updateRoute
      );

      res.json(isFavorite);
    } catch (error) {
      next(error);
    }
  }
);

authRouter.patch(
  '/live-share-token',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).send('Invalid payload');
        return;
      }
      const result = await getAccountCollection().updateOne(
        { steamId: req.account!.steamId },
        {
          $set: {
            liveShareToken: token,
          },
        }
      );
      if (!result.modifiedCount) {
        res.status(404).end('Account not changed');
        return;
      }
      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.patch('/account', ensureAuthenticated, async (req, res, next) => {
  try {
    const { presets } = req.body;

    if (!Array.isArray(presets)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const updatedAccount = await getAccountCollection().findOneAndUpdate(
      { steamId: req.account!.steamId },
      {
        $set: {
          presets: presets,
        },
      },
      { returnDocument: 'after' }
    );
    if (!updatedAccount.ok || !updatedAccount.value) {
      res.status(404).end('Account not changed');
      return;
    }
    const account = {
      ...updatedAccount.value,
      sessionId:
        updatedAccount.value.sessionIds[
          updatedAccount.value.sessionIds.length - 1
        ],
    };
    res.json(account);
  } catch (error) {
    next(error);
  }
});

export default authRouter;
