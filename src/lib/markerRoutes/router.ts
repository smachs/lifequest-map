import type { Filter } from 'mongodb';
import { Router } from 'express';
import type { MarkerRouteDTO } from './types';
import { Double, ObjectId } from 'mongodb';
import { getMarkerRoutesCollection } from './collection';
import { postToDiscord } from '../discord';
import { getUsersCollection } from '../users/collection';

const markerRoutesRouter = Router();

markerRoutesRouter.post('/', async (req, res, next) => {
  try {
    const { name, username, isPublic, positions, markersByType } = req.body;

    const markerRoute: MarkerRouteDTO = {
      name.substring(0, 100),
      username.substring(0, 50),
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
    const existingUser = await getUsersCollection().findOne({ username });
    if (!existingUser) {
      res.status(400).send('User not exist');
      return;
    }
    const inserted = await getMarkerRoutesCollection().insertOne(markerRoute);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting marker');
      return;
    }
    res.status(200).json(markerRoute);

    postToDiscord(
      `🗺️ New route ${name} added by ${username}`,
      markerRoute.isPublic
    );
  } catch (error) {
    next(error);
  }
});

markerRoutesRouter.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    let query: Filter<MarkerRouteDTO> | undefined = undefined;
    if (typeof userId === 'string' && userId) {
      const user = await getUsersCollection().findOne({
        _id: new ObjectId(userId),
      });
      if (user) {
        query = {
          $or: [
            {
              username: user.username,
            },
            {
              isPublic: true,
            },
          ],
        };
      }
    }
    if (!query) {
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

markerRoutesRouter.delete('/:markerRouteId', async (req, res, next) => {
  try {
    const { markerRouteId } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(markerRouteId) || !ObjectId.isValid(userId)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const user = await getUsersCollection().findOne({
      _id: new ObjectId(userId),
    });
    if (!user) {
      res.status(401).send('No access');
      return;
    }

    const query: Filter<MarkerRouteDTO> = {
      _id: new ObjectId(markerRouteId),
    };
    if (!user.isModerator) {
      query.username = user.username;
    }

    const markerRoutesCollection = getMarkerRoutesCollection();
    const markerRoute = await markerRoutesCollection.findOne(query);
    if (!markerRoute) {
      res.status(404).end(`No marker route found for id ${markerRouteId}`);
      return;
    }

    const result = await getMarkerRoutesCollection().deleteOne(query);
    if (!result.deletedCount) {
      res.status(404).end(`No marker route found for id ${markerRouteId}`);
      return;
    }
    res.status(200).json({});
    postToDiscord(
      `🗺️💀 Route ${markerRoute.name} deleted by ${user.username}`,
      markerRoute.isPublic
    );
  } catch (error) {
    next(error);
  }
});

export default markerRoutesRouter;
