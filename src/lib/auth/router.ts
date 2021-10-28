import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import passport from 'passport';
import { v4 as uuid, validate as validateUUID } from 'uuid';
import { postToDiscord } from '../discord';
import { getAccountCollection } from './collection';
import type { AccountDTO } from './types';

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
export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.query?.sessionId;
  if (typeof sessionId !== 'string' || !validateUUID(sessionId)) {
    res.status(401).send('No access');
    return;
  }
  const account = await getAccountCollection().findOne({ sessionId });
  if (!account) {
    res.status(401).send('No access');
    return;
  }
  req.account = account;
  next();
}

authRouter.get('/session', (_req, res) => {
  const sessionId = uuid();
  res.json(sessionId);
});

authRouter.get('/account', ensureAuthenticated, function (req, res) {
  res.json(req.account);
});

authRouter.get('/logout', ensureAuthenticated, async function (req, res) {
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
      res.sendStatus(401);
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
      res.sendStatus(401);
    }
  },
  passport.authenticate('steam', { failureRedirect: '/' }),
  async (req, res) => {
    if (!req.isAuthenticated()) {
      res.sendStatus(401);
      return;
    }
    const result = await getAccountCollection().findOneAndUpdate(
      { steamId: req.user.steamId },
      {
        $set: {
          name: req.user.displayName,
          sessionId: req.session.sessionId,
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
  }
);

export default authRouter;
