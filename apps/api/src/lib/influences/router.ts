import { Router } from 'express';
import type { Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { worlds } from 'static';
import { getInfluencesCollection } from './collection.js';
import type { InfluenceDTO } from './types.js';
import { generateInfluenceSVG } from './utils.js';

const influencesRouter = Router();

influencesRouter.get('/', async (_req, res, next) => {
  try {
    const activeWorldNames = worlds.map((world) => world.worldName);
    const latestInfluences = await getInfluencesCollection()
      .aggregate([
        {
          $match: {
            worldName: { $in: activeWorldNames },
          },
        },
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

influencesRouter.get('/:worldName', async (req, res, next) => {
  try {
    const world = worlds.find(
      (world) => world.worldName === req.params.worldName
    );
    if (!world) {
      res.status(404).send('Not found');
      return;
    }

    const influences = await getInfluencesCollection()
      .find({ worldName: world.worldName })
      .sort({ createdAt: 1 })
      .toArray();
    res.status(200).json(influences);
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

influencesRouter.get('/images/:influenceId', async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.influenceId)) {
      res.status(400).send('Invalid ID');
      return;
    }
    const influence = await getInfluencesCollection().findOne({
      _id: new ObjectId(req.params.influenceId),
    });
    if (!influence) {
      res.status(404).send('Not found');
      return;
    }
    const embed = req.query.embed === 'true';
    const svg = await generateInfluenceSVG(
      influence.worldName,
      influence.influence,
      embed
    );
    res.setHeader('Content-Type', 'image/svg+xml');
    res.header('Vary', 'Accept-Encoding');
    res.send(svg);
  } catch (error) {
    next(error);
  }
});

export default influencesRouter;
