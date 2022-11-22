import { Router } from 'express';
import type { Filter } from 'mongodb';
import { getInfluencesCollection } from './collection.js';
import type { InfluenceDTO } from './types.js';

const influencesRouter = Router();

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
