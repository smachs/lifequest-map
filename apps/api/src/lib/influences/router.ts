import { Router } from 'express';
import type { Filter } from 'mongodb';
import { getInfluencesCollection } from './collection.js';
import type { InfluenceDTO } from './types.js';

const influencesRouter = Router();

influencesRouter.get('/', async (_req, res, next) => {
  try {
    const latestInfluences = await getInfluencesCollection()
      .aggregate([
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: '$worldName',
            worldName: { $first: '$worldName' },
            username: { $first: '$username' },
            influence: { $first: '$influence' },
            createdAt: { $first: '$createdAt' },
          },
        },
      ])
      .toArray();

    res.status(200).json(latestInfluences);
  } catch (error) {
    next(error);
  }
});

influencesRouter.get('/today', async (req, res, next) => {
  try {
    const { worldName } = req.query;

    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const filter: Filter<InfluenceDTO> = {
      createdAt: {
        $gte: midnight,
      },
    };
    if (typeof worldName === 'string') {
      filter.worldName = worldName;
    }

    const todaysInfluences = await getInfluencesCollection().countDocuments(
      filter
    );
    res.status(200).json(todaysInfluences);
  } catch (error) {
    next(error);
  }
});

export default influencesRouter;
