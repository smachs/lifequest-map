import { Router } from 'express';
import { getItemsCollection } from '../items/collection.js';
import { getMarkersCollection } from '../markers/collection.js';

const searchRouter = Router();

searchRouter.get('/', async (_req, res, next) => {
  try {
    const [from, name, loot] = await Promise.all([
      getMarkersCollection().distinct('username', { isPrivate: { $ne: true } }),
      getMarkersCollection().distinct('name', {
        name: { $exists: true },
        isPrivate: { $ne: true },
      }),
      getItemsCollection().distinct('name'),
    ]);

    res.status(200).json({
      from,
      name,
      loot,
    });
  } catch (error) {
    next(error);
  }
});

searchRouter.get('/from/:username', async (req, res, next) => {
  try {
    const markerIds = await getMarkersCollection()
      .find({ username: req.params.username }, { projection: { _id: 1 } })
      .map((doc) => doc._id.toString())
      .toArray();

    res.status(200).json(markerIds);
  } catch (error) {
    next(error);
  }
});

searchRouter.get('/loot/:name', async (req, res, next) => {
  try {
    const results = await getItemsCollection()
      .find({ name: req.params.name }, { projection: { markerIds: 1 } })
      .map((doc) => doc.markerIds)
      .toArray();
    res.status(200).json(results.flat());
  } catch (error) {
    next(error);
  }
});

export default searchRouter;
