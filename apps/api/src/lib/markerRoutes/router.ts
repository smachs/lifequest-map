import { Router } from 'express';
import type { Filter } from 'mongodb';
import { Double, ObjectId } from 'mongodb';
import { findMapDetails, findRegions, mapIsAeternumMap } from 'static';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { getCommentsCollection } from '../comments/collection.js';
import type { CommentDTO } from '../comments/types.js';
import { getMarkerRoutesURL, postToDiscord } from '../discord.js';
import { getMarkerRoutesCollection } from './collection.js';
import type { MarkerRouteDTO } from './types.js';

const markerRoutesRouter = Router();

const MAX_MARKER_ROUTE_LENGTH = 100;
markerRoutesRouter.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const {
      name,
      description,
      isPublic,
      positions,
      texts,
      markersByType,
      map,
      origin,
    } = req.body;
    const account = req.account!;

    if (
      typeof name !== 'string' ||
      name.length > MAX_MARKER_ROUTE_LENGTH ||
      typeof isPublic !== 'boolean'
    ) {
      res.status(400).send('Invalid payload');
      return;
    }

    if (positions.length === 0 || !Array.isArray(positions)) {
      res.status(400).send('Invalid payload');
      return;
    }

    const now = new Date();
    const markerRoute: MarkerRouteDTO = {
      name,
      userId: account.steamId,
      username: account.name,
      positions: positions.map((position) =>
        position.map((part: number) => new Double(part))
      ) as [Double, Double][],
      regions: findRegions(positions, map),
      markersByType,
      isPublic: Boolean(isPublic),
      createdAt: now,
      updatedAt: now,
    };

    if (Array.isArray(texts)) {
      markerRoute.texts = texts.map((text) => ({
        position: text.position.map((part: number) => new Double(part)) as [
          Double,
          Double
        ],
        text: text.text,
      }));
    }

    if (typeof description === 'string') {
      markerRoute.description = description;
    }

    if (ObjectId.isValid(origin)) {
      markerRoute.origin = new ObjectId(origin);
    }

    if (
      typeof map === 'string' &&
      !mapIsAeternumMap(map) &&
      findMapDetails(map)
    ) {
      markerRoute.map = map;
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existingMarkerRoute = await getMarkerRoutesCollection().findOne({
      name: new RegExp(`^${escapedName}$`, 'i'),
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
    if (markerRoute.origin) {
      await getMarkerRoutesCollection().updateOne(
        { _id: new ObjectId(markerRoute.origin) },
        { $inc: { forks: 1 } }
      );
    }

    res.status(200).json(markerRoute);

    postToDiscord(
      `🗺️ ${markerRoute.origin ? 'Forked' : 'New'} route ${name} added by ${
        account.name
      }\n${getMarkerRoutesURL(inserted.insertedId.toString(), map)}`,
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
      .find(query, { projection: { usage: 0 } })
      .sort({ lastUsedAt: -1, updatedAt: -1 })
      .toArray();
    res.status(200).json(markerRoutes);
  } catch (error) {
    next(error);
  }
});

markerRoutesRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const markerRouteId = new ObjectId(id);
    const markerRoute = await getMarkerRoutesCollection().findOne(
      {
        _id: markerRouteId,
      },
      { projection: { usage: 0 } }
    );
    if (!markerRoute) {
      res.status(404).json({ message: 'No route found' });
      return;
    }
    const comments = await getCommentsCollection()
      .find({ markerRouteId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ markerRoute, comments });
  } catch (error) {
    next(error);
  }
});

markerRoutesRouter.delete(
  '/:id',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        res.status(400).send('Invalid payload');
        return;
      }
      const markerRouteId = new ObjectId(id);
      const query: Filter<MarkerRouteDTO> = {
        _id: markerRouteId,
      };
      if (!account.isModerator) {
        query.userId = account.steamId;
      }

      const markerRoutesCollection = getMarkerRoutesCollection();
      const markerRoute = await markerRoutesCollection.findOne(query);
      if (!markerRoute) {
        res.status(404).end(`No marker route found for id ${id}`);
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
        res.status(404).end(`No marker route found for id ${id}`);
        return;
      }
      if (markerRoute.origin) {
        await getMarkerRoutesCollection().updateOne(
          { _id: new ObjectId(markerRoute.origin) },
          { $inc: { forks: -1 } }
        );
      }
      await getCommentsCollection().deleteMany({
        markerRouteId,
      });

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
  '/:id',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;

      const { id } = req.params;
      const {
        name,
        description,
        isPublic,
        positions,
        markersByType,
        map,
        texts,
      } = req.body;

      if (!ObjectId.isValid(id)) {
        res.status(400).send('Invalid payload');
        return;
      }

      const query: Filter<MarkerRouteDTO> = {
        _id: new ObjectId(id),
      };
      if (!account.isModerator) {
        query.userId = account.steamId;
      }
      const markerRoutesCollection = getMarkerRoutesCollection();
      const existingMarkerRoute = await markerRoutesCollection.findOne(query);
      if (!existingMarkerRoute) {
        res.status(404).end(`No marker route found for id ${id}`);
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

      const now = new Date();
      const markerRoute: Partial<MarkerRouteDTO> = {
        updatedAt: now,
      };
      if (typeof name === 'string' && name.length <= MAX_MARKER_ROUTE_LENGTH) {
        markerRoute.name = name;
      }
      if (typeof description === 'string') {
        markerRoute.description = description;
      }
      if (typeof isPublic === 'boolean') {
        markerRoute.isPublic = isPublic;
      }
      if (
        typeof map === 'string' &&
        !mapIsAeternumMap(map) &&
        findMapDetails(map)
      ) {
        markerRoute.map = map;
      }
      if (Array.isArray(positions)) {
        markerRoute.regions = findRegions(positions, map);
        markerRoute.positions = positions.map((position) =>
          position.map((part: number) => new Double(part))
        ) as [Double, Double][];
        if (markerRoute.positions.length === 0) {
          res.status(400).send('Invalid payload');
          return;
        }
      }
      if (Array.isArray(texts)) {
        markerRoute.texts = texts.map((text) => ({
          position: text.position.map((part: number) => new Double(part)) as [
            Double,
            Double
          ],
          text: text.text,
        }));
      }

      if (typeof markersByType !== 'undefined') {
        markerRoute.markersByType = markersByType;
      }

      const result = await getMarkerRoutesCollection().findOneAndUpdate(query, {
        $set: markerRoute,
      });

      if (!result.ok || !result.value) {
        res.status(404).end(`No marker route found for id ${id}`);
        return;
      }
      res.status(200).json(result.value);
      postToDiscord(
        `🗺️ Route ${result.value.name} updated by ${
          account.name
        }\n${getMarkerRoutesURL(result.value._id.toString(), markerRoute.map)}`,
        markerRoute.isPublic
      );
    } catch (error) {
      next(error);
    }
  }
);

markerRoutesRouter.post(
  '/:id/comments',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { id } = req.params;
      const { message, isIssue } = req.body;

      if (typeof message !== 'string' || !ObjectId.isValid(id)) {
        res.status(400).send('Invalid payload');
        return;
      }
      const markerRouteId = new ObjectId(id);
      const comment: CommentDTO = {
        markerRouteId,
        userId: account.steamId,
        username: account.name,
        message,
        createdAt: new Date(),
        isIssue: Boolean(isIssue),
      };

      const markerRoute = await getMarkerRoutesCollection().findOne({
        _id: comment.markerRouteId,
      });
      if (!markerRoute) {
        res.status(404).send("Route doesn't exists");
        return;
      }
      const inserted = await getCommentsCollection().insertOne(comment);
      if (!inserted.acknowledged) {
        res.status(500).send('Error inserting comment');
        return;
      }

      const comments = await getCommentsCollection()
        .find({
          markerRouteId,
        })
        .toArray();

      await getMarkerRoutesCollection().updateOne(
        { _id: markerRouteId },
        {
          $set: {
            comments: comments.filter((comment) => !comment.isIssue).length,
            issues: comments.filter((comment) => comment.isIssue).length,
          },
        }
      );

      res.status(200).json(comment);

      if (comment.isIssue) {
        await postToDiscord(
          `⚠️ ${account.name} added an issue for route ${markerRoute.name}:\n${
            comment.message
          }\n${getMarkerRoutesURL(id, markerRoute.map)}`,
          markerRoute.isPublic
        );
      } else {
        await postToDiscord(
          `✍ ${account.name} added a comment for route ${markerRoute.name}:\n${
            comment.message
          }\n${getMarkerRoutesURL(id, markerRoute.map)}`,
          markerRoute.isPublic
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

markerRoutesRouter.post(
  '/:id/usage',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;

      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        res.status(400).send('Invalid payload');
        return;
      }

      const query: Filter<MarkerRouteDTO> = {
        _id: new ObjectId(id),
      };
      const markerRoute = await getMarkerRoutesCollection().findOne(query);
      if (!markerRoute) {
        res.status(404).end(`No marker route found for id ${id}`);
        return;
      }
      if (!markerRoute.usage) {
        markerRoute.usage = [];
      }
      const existingUsage = markerRoute.usage.find(
        (usage) => usage.userId === account.steamId
      );
      const now = new Date();
      if (!existingUsage) {
        markerRoute.usage.push({
          userId: account.steamId,
          lastUsedAt: now,
        });
      } else {
        existingUsage.lastUsedAt = now;
      }
      await getMarkerRoutesCollection().updateOne(query, {
        $set: {
          lastUsedAt: now,
          usageCount: markerRoute.usage.length,
          usage: markerRoute.usage,
        },
      });
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default markerRoutesRouter;
