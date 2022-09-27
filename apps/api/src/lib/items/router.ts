import { Router } from 'express';
import { getItemsCollection } from './collection.js';
import { updateItems } from './update.js';

const itemsRouter = Router();

itemsRouter.get('/markers/:id', async (req, res, next) => {
  try {
    const items = await getItemsCollection()
      .find({ markerIds: req.params.id })
      .toArray();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

itemsRouter.get('/update', async (req, res, next) => {
  try {
    if (req.query.secret !== process.env.UPDATE_SECRET) {
      res.status(401).send('Not allowed');
      return;
    }
    await updateItems();
    res.status(200).send('Done');
  } catch (error) {
    next(error);
  }
});

export default itemsRouter;
