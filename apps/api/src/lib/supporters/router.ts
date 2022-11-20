import { Router } from 'express';
import { getSupportersCollection } from './collection.js';
import { v4 as uuid } from 'uuid';
import type { OptionalId } from 'mongodb';
import type { SupporterDTO } from './types.js';

const supportersRouter = Router();

supportersRouter.post('/', async (req, res, next) => {
  try {
    if (req.query.secret !== process.env.UPDATE_SECRET) {
      res.status(401).send('Not allowed');
      return;
    }
    const secret = uuid();
    const doc: OptionalId<SupporterDTO> = {
      secret,
      createdAt: new Date(),
    };

    const { patronId } = req.body;
    if (typeof patronId === 'string') {
      doc.patronId = patronId;
    }
    const result = await getSupportersCollection().insertOne(doc);
    if (!result.acknowledged) {
      res.status(500).json({ message: "Couldn't create supporter secret" });
      return;
    }
    res.status(200).json(secret);
  } catch (error) {
    next(error);
  }
});

export default supportersRouter;
