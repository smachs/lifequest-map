import type { NextFunction, Request, Response } from 'express';
import { validate as validateUUID } from 'uuid';
import { getAccountCollection } from './collection.js';

export async function readAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { 'x-session-id': sessionId, 'x-prevent-logout': preventLogout } =
    req.headers;
  if (typeof sessionId !== 'string') {
    next();
    return;
  }
  if (!validateUUID(sessionId)) {
    res.status(401).send('😞 Invalid session. Please login again.');
    return;
  }
  const account = await getAccountCollection().findOne({
    sessionIds: sessionId,
  });
  if (!account) {
    if (preventLogout) {
      next();
    } else {
      res.status(401).send('😞 Session expired. Please login again.');
    }
    return;
  }
  req.account = account;
  next();
}

export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.account) {
    res.status(403).send('💀 no access');
    return;
  }
  next();
}
