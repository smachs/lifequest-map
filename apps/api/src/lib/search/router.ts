import { Router } from 'express';
import { getMarkersCollection } from '../markers/collection.js';

const searchRouter = Router();

searchRouter.get('/', async (_req, res, next) => {
  try {
    const [from, name] = await Promise.all([
      getMarkersCollection().distinct('username'),
      getMarkersCollection().distinct('name'),
    ]);

    res.status(200).json({
      from,
      name: name.filter((name) => name !== null), // Without `null`
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

export default searchRouter;
