import type { Filter } from 'mongodb';
import { Router } from 'express';
import type { MarkerRouteDTO } from './types';
import { Double, ObjectId } from 'mongodb';
import { getMarkerRoutesCollection } from './collection';
import { postToDiscord } from '../discord';
import { ensureAuthenticated } from '../auth/middlewares';

const markerRoutesRouter = Router();

const MAX_MARKER_ROUTE_LENGTH = 100;
markerRoutesRouter.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const { name, isPublic, positions, markersByType } = req.body;
    const account = req.account!;

    if (
      typeof name !== 'string' ||
      name.length > MAX_MARKER_ROUTE_LENGTH ||
      typeof isPublic !== 'boolean'
    ) {
      res.status(400).send('Invalid payload');
      return;
    }

    const markerRoute: MarkerRouteDTO = {
      name,
      userId: account.steamId,
      username: account.name,
      positions,
      markersByType,
      isPublic: Boolean(isPublic),
      createdAt: new Date(),
    };
    if (Array.isArray(positions)) {
      markerRoute.positions = positions.map((position) =>
        position.map((part: number) => new Double(part))
      ) as [Double, Double][];
    }

    if (markerRoute.positions.length === 0) {
      res.status(400).send('Invalid payload');
      return;
    }

    const existingMarkerRoute = await getMarkerRoutesCollection().findOne({
      name: new RegExp(`^${name}$`, 'i'),
      username: account.name,
    });
    if (existingMarkerRoute) {
      res.status(409).send('Route with same name already exists');
      return;
    }
    const inserted = await getMarkerRoutesCollection().insertOne(markerRoute);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting marker');
      return;
    }
    res.status(200).json(markerRoute);

    postToDiscord(
      `🗺️ New route ${name} added by ${account.name}`,
      markerRoute.isPublic
    );
  } catch (error) {
    next(error);
  }
});

markerRoutesRouter.get('/', async (req, res, next) => {
  try {
    const account = req.account;

    let query: Filter<MarkerRouteDTO> | undefined = undefined;
    if (account) {
      query = {
        $or: [
          {
            userId: account.steamId,
          },
          {
            isPublic: true,
          },
        ],
      };
    } else {
      query = { isPublic: true };
    }
    const markerRoutes = await getMarkerRoutesCollection()
      .find(query)
      .toArray();
    res.status(200).json(markerRoutes);
  } catch (error) {
    next(error);
  }
});

markerRoutesRouter.delete(
  '/:markerRouteId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;

      const { markerRouteId } = req.params;

      if (!ObjectId.isValid(markerRouteId)) {
        res.status(400).send('Invalid payload');
        return;
      }

      const query: Filter<MarkerRouteDTO> = {
        _id: new ObjectId(markerRouteId),
      };
      if (!account.isModerator) {
        query.userId = account.steamId;
      }

      const markerRoutesCollection = getMarkerRoutesCollection();
      const markerRoute = await markerRoutesCollection.findOne(query);
      if (!markerRoute) {
        res.status(404).end(`No marker route found for id ${markerRouteId}`);
        return;
      }
      if (
        markerRoute.isPublic &&
        !account.isModerator &&
        markerRoute.userId !== account.steamId
      ) {
        res.status(403).send('💀 no access');
        return;
      }

      const result = await getMarkerRoutesCollection().deleteOne(query);
      if (!result.deletedCount) {
        res.status(404).end(`No marker route found for id ${markerRouteId}`);
        return;
      }
      res.status(200).json({});
      postToDiscord(
        `🗺️💀 Route ${markerRoute.name} deleted by ${account.name}`,
        markerRoute.isPublic
      );
    } catch (error) {
      next(error);
    }
  }
);

markerRoutesRouter.patch(
  '/:markerRouteId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;

      const { markerRouteId } = req.params;
      const { name, isPublic, positions, markersByType } = req.body;

      if (!ObjectId.isValid(markerRouteId)) {
        res.status(400).send('Invalid payload');
        return;
      }

      const query: Filter<MarkerRouteDTO> = {
        _id: new ObjectId(markerRouteId),
      };
      if (!account.isModerator) {
        query.userId = account.steamId;
      }
      const markerRoutesCollection = getMarkerRoutesCollection();
      const existingMarkerRoute = await markerRoutesCollection.findOne(query);
      if (!existingMarkerRoute) {
        res.status(404).end(`No marker route found for id ${markerRouteId}`);
        return;
      }
      if (
        existingMarkerRoute.isPublic &&
        !account.isModerator &&
        existingMarkerRoute.userId !== account.steamId
      ) {
        res.status(403).send('💀 no access');
        return;
      }

      const markerRoute: Partial<MarkerRouteDTO> = {};
      if (typeof name === 'string' && name.length <= MAX_MARKER_ROUTE_LENGTH) {
        markerRoute.name = name;
      }
      if (typeof isPublic === 'boolean') {
        markerRoute.isPublic = isPublic;
      }
      if (Array.isArray(positions)) {
        markerRoute.positions = positions.map((position) =>
          position.map((part: number) => new Double(part))
        ) as [Double, Double][];
        if (markerRoute.positions.length === 0) {
          res.status(400).send('Invalid payload');
          return;
        }
      }

      if (typeof markersByType !== 'undefined') {
        markerRoute.markersByType = markersByType;
      }

      const result = await getMarkerRoutesCollection().findOneAndUpdate(query, {
        $set: markerRoute,
      });

      if (!result.ok) {
        res.status(404).end(`No marker route found for id ${markerRouteId}`);
        return;
      }
      res.status(200).json(result.value);

      postToDiscord(
        `🗺️ Route ${markerRoute.name} updated by ${account.name}`,
        markerRoute.isPublic
      );
    } catch (error) {
      next(error);
    }
  }
);

export default markerRoutesRouter;
