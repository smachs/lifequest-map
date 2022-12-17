import { Router } from 'express';
import { getSupportersCollection } from './collection.js';
import { v4 as uuid } from 'uuid';
import type { OptionalId } from 'mongodb';
import type { SupporterDTO } from './types.js';
import { findPatron } from './utils.js';

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

    const { patronEmail } = req.body;
    if (typeof patronEmail === 'string') {
      const patron = await findPatron(patronEmail);
      if (!patron) {
        res.status(404).send('Patron not found');
        return;
      }
      const supporter = await getSupportersCollection().findOne({
        patronId: patron.id,
      });
      if (supporter) {
        res.status(400).send('Patron already exist');
        return;
      }
      doc.patronId = patron.id;
    }
    const result = await getSupportersCollection().insertOne(doc);
    if (!result.acknowledged) {
      res.status(500).json({ message: "Couldn't create supporter secret" });
      return;
    }
    const message = `Thx for supporting me 🤘<br/><br/>
Please enter this secret in the app settings to disable ads:<br/><br/>
${secret}<br/><br/>
After you entered the secret, the ads should disappear. Reload the website afterwards to remove these ads too.<br/>
Please let me know, if it works for you.<br/><br/>
Best<br/>
Leon
`;
    res.status(200).send(message);
  } catch (error) {
    next(error);
  }
});

export default supportersRouter;
