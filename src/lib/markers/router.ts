import type { Filter } from 'mongodb';
import { Router } from 'express';
import { mapFilters } from '../../app/components/MapFilter/mapFilters';
import { getMarkersCollection } from './collection';
import { Double, ObjectId } from 'mongodb';
import { getUsersCollection } from '../users/collection';
import type { MarkerDTO } from './types';
import fs from 'fs/promises';
import { postToDiscord } from '../discord';
import { getCommentsCollection } from '../comments/collection';
import type { CommentDTO } from '../comments/types';
import { SCREENSHOTS_PATH } from '../env';

const markersRouter = Router();

markersRouter.get('/', async (_req, res, next) => {
  try {
    const markers = await getMarkersCollection()
      .find(
        {},
        {
          projection: {
            description: 0,
            username: 0,
            screenshotFilename: 0,
            createdAt: 0,
          },
        }
      )
      .toArray();
    res.status(200).json(markers);
  } catch (error) {
    next(error);
  }
});

markersRouter.get('/:markerId', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    if (!ObjectId.isValid(markerId)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const marker = await getMarkersCollection().findOne({
      _id: new ObjectId(markerId),
    });
    const comments = await getCommentsCollection()
      .find({ markerId: new ObjectId(markerId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ marker, comments });
  } catch (error) {
    next(error);
  }
});

markersRouter.delete('/:markerId', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    const { userId } = req.body;

    if (!ObjectId.isValid(markerId) || !ObjectId.isValid(userId)) {
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
    const query: Filter<MarkerDTO> = {
      _id: new ObjectId(markerId),
    };
    if (!user.isModerator) {
      query.username = user.username;
    }
    const markerCollection = getMarkersCollection();
    const marker = await markerCollection.findOne(query);
    if (!marker) {
      res.status(404).end(`No marker found for id ${markerId}`);
      return;
    }

    const result = await markerCollection.deleteOne(query);
    if (!result.deletedCount) {
      res.status(404).end(`No marker found for id ${markerId}`);
      return;
    }
    await getCommentsCollection().deleteMany({
      markerId: new ObjectId(markerId),
    });
    if (marker.screenshotFilename) {
      await fs
        .rm(`${SCREENSHOTS_PATH}/${marker.screenshotFilename}`)
        .catch(() =>
          console.warn(
            `Could not remove screenshot ${marker.screenshotFilename}`
          )
        );
    }
    res.status(200).json({});
    postToDiscord(
      `📌💀 Marker from ${marker.username} deleted by ${user.username}`
    );
  } catch (error) {
    next(error);
  }
});

markersRouter.patch('/:markerId', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    const { screenshotFilename } = req.body;

    if (typeof screenshotFilename !== 'string' || !ObjectId.isValid(markerId)) {
      res.status(400).send('Invalid payload');
      return;
    }

    const result = await getMarkersCollection().updateOne(
      {
        _id: new ObjectId(markerId),
      },
      {
        $set: {
          screenshotFilename,
        },
      }
    );
    if (!result.modifiedCount) {
      res.status(404).end(`No marker found for id ${markerId}`);
      return;
    }
    res.status(200).json(screenshotFilename);
  } catch (error) {
    next(error);
  }
});

markersRouter.post('/', async (req, res, next) => {
  try {
    const {
      type,
      position,
      positions,
      name,
      username,
      level,
      levelRange,
      description,
      screenshotFilename,
    } = req.body;

    if (typeof type !== 'string' || typeof username !== 'string') {
      res.status(400).send('Invalid payload');
      return;
    }
    const marker: MarkerDTO = {
      type,
      username,
      createdAt: new Date(),
    };
    if (position) {
      marker.position = position.map(
        (part: number) => new Double(+part.toFixed(2))
      ) as [Double, Double, Double];
    }
    if (Array.isArray(positions)) {
      marker.positions = positions.map((position) =>
        position.map((part: number) => new Double(part))
      ) as [Double, Double][];
    }
    if (name) {
      marker.name = name;
    }
    if (level) {
      marker.level = level;
    }
    if (description) {
      marker.description = description;
    }
    if (screenshotFilename) {
      marker.screenshotFilename = screenshotFilename;
    }
    if (levelRange) {
      marker.levelRange = levelRange;
    }

    if (!mapFilters.some((filter) => filter.type === marker.type)) {
      res.status(400).send(`Unknown type ${marker.type}`);
      return;
    }
    const existingMarker = await getMarkersCollection().findOne({
      type: marker.type,
      position: marker.position,
      positions: marker.positions,
    });
    if (existingMarker) {
      res.status(409).send('Marker already exists');
      return;
    }
    if (marker.position) {
      const nearByMarker = await getMarkersCollection().findOne({
        type: marker.type,
        position: { $near: marker.position, $maxDistance: 2 },
      });
      if (nearByMarker) {
        res.status(409).send('A similar marker is too near');
        return;
      }
    }

    const inserted = await getMarkersCollection().insertOne(marker);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting marker');
      return;
    }
    res.status(200).json(marker);

    const mapFilter = mapFilters.find((filter) => filter.type === marker.type);
    if (!mapFilter) {
      console.error(`Unknown type ${marker.type}`);
      return;
    }

    await postToDiscord(
      `📌 ${mapFilter.title} was added by ${marker.username} at [${position}]`
    );
  } catch (error) {
    next(error);
  }
});

markersRouter.post('/:markerId/comments', async (req, res, next) => {
  try {
    const { markerId } = req.params;
    const { username, message } = req.body;

    if (
      typeof username !== 'string' ||
      typeof message !== 'string' ||
      !ObjectId.isValid(markerId)
    ) {
      res.status(400).send('Invalid payload');
      return;
    }

    const comment: CommentDTO = {
      markerId: new ObjectId(markerId),
      username,
      message,
      createdAt: new Date(),
    };

    const marker = await getMarkersCollection().findOne({
      _id: comment.markerId,
    });
    if (!marker) {
      res.status(404).send("Marker doesn't exists");
      return;
    }
    const inserted = await getCommentsCollection().insertOne(comment);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting comment');
      return;
    }

    await getMarkersCollection().updateOne(
      { _id: new ObjectId(markerId) },
      {
        $set: {
          comments: await getCommentsCollection()
            .find({ markerId: new ObjectId(markerId) })
            .count(),
        },
      }
    );

    res.status(200).json(comment);
    const position = marker.position ? marker.position.join(', ') : 'unknown';
    await postToDiscord(
      `✍ ${comment.username} added a comment for ${marker.type} at [${position}]:\n${comment.message}`
    );
  } catch (error) {
    next(error);
  }
});

export default markersRouter;
