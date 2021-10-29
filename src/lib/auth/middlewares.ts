import type { NextFunction, Request, Response } from 'express';
import { validate as validateUUID } from 'uuid';
import { getAccountCollection } from './collection';

export async function readAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { 'x-session-id': sessionId } = req.headers;
  if (typeof sessionId !== 'string' || !validateUUID(sessionId)) {
    next();
    return;
  }
  const account = await getAccountCollection().findOne({ sessionId });
  if (!account) {
    res.status(401).send('😞 Session expired. Please login again.');
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
