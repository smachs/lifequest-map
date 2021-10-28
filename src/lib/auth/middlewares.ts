import type { NextFunction, Request, Response } from 'express';
import { validate as validateUUID } from 'uuid';
import { getAccountCollection } from './collection';

export async function readAccount(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const sessionId = req.query?.sessionId;
  if (typeof sessionId !== 'string' || !validateUUID(sessionId)) {
    next();
    return;
  }
  const account = await getAccountCollection().findOne({ sessionId });
  if (!account) {
    next();
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
    res.status(401).send('💀 no access');
    return;
  }
  next();
}
