import etag from 'etag';
import { Router } from 'express';
import fs from 'fs/promises';
import type { Filter, WithId } from 'mongodb';
import { Double, ObjectId } from 'mongodb';
import type { MarkerDTO } from 'static';
import { findMapDetails, mapFilters, mapIsAeternumMap } from 'static';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { getCommentsCollection } from '../comments/collection.js';
import type { CommentDTO } from '../comments/types.js';
import { getMarkerURL, postToDiscord } from '../discord.js';
import { SCREENSHOTS_PATH } from '../env.js';
import { getScreenshotsCollection } from '../screenshots/collection.js';
import { getMarkersCollection } from './collection.js';

const markersRouter = Router();

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 2000;

export let lastMarkers: WithId<MarkerDTO>[] = [];
let lastMarkersJSON = '[]';
let lastETag = '';

const types = mapFilters.map((filter) => filter.type);
export const refreshMarkers = async () => {
  lastMarkers = await getMarkersCollection()
    .find(
      {
        isPrivate: { $ne: true },
        type: { $in: types },
      },
      {
        projection: {
          userId: 0,
          username: 0,
          screenshotFilename: 0,
          createdAt: 0,
          isPrivate: 0,
        },
      }
    )
    .toArray();
  lastMarkersJSON = JSON.stringify(lastMarkers);
  lastETag = etag(lastMarkersJSON);
};

markersRouter.get('/', async (req, res, next) => {
  try {
    if (req.get('If-None-Match') === lastETag) {
      res.status(304).end();
      return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('ETag', lastETag);
    res.status(200).send(lastMarkersJSON);
  } catch (error) {
    next(error);
  }
});

markersRouter.get('/:markerId', async (req, res, next) => {
  try {
    const account = req.account;
    const { markerId } = req.params;
    if (!ObjectId.isValid(markerId)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const query: Filter<MarkerDTO> = account
      ? {
          $or: [{ isPrivate: { $ne: true } }, { userId: account.steamId }],
        }
      : {
          isPrivate: { $ne: true },
        };
    query._id = new ObjectId(markerId);
    const marker = await getMarkersCollection().findOne(query);
    const comments = await getCommentsCollection()
      .find({ markerId: new ObjectId(markerId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ marker, comments });
  } catch (error) {
    next(error);
  }
});

markersRouter.delete(
  '/:markerId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { markerId } = req.params;

      if (!ObjectId.isValid(markerId)) {
        res.status(400).send('Invalid payload');
        return;
      }
      const query: Filter<MarkerDTO> = {
        _id: new ObjectId(markerId),
      };
      if (!account.isModerator) {
        query.userId = account.steamId;
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
        await getScreenshotsCollection().deleteOne({
          filename: marker.screenshotFilename,
        });
      }
      await refreshMarkers();
      res.status(200).json({});

      let nameType = marker.name
        ? `${marker.type} ${marker.name}`
        : marker.type;
      if (marker.size) {
        nameType += ` (${marker.size})`;
      }
      postToDiscord(
        `📌💀 ${nameType} from ${marker.username} at [${marker.position}] was deleted by ${account.name}`,
        !marker.isPrivate,
        marker.realm
      );
    } catch (error) {
      next(error);
    }
  }
);

markersRouter.patch(
  '/:markerId',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { markerId } = req.params;

      const marker = await bodyToMarker(req.body);
      if (!marker) {
        res.status(400).send('Invalid payload');
        return;
      }

      const query: Filter<MarkerDTO> = {
        _id: new ObjectId(markerId),
      };
      if (!account.isModerator) {
        query.$or = [
          { userId: account.steamId },
          { screenshotFilename: { $exists: false } },
        ];
      }

      const mapFilter = mapFilters.find(
        (filter) => filter.type === marker.type
      );
      if (!mapFilter) {
        res.status(400).send('Invalid filter type');
        return;
      }

      const unset: {
        [K in keyof MarkerDTO]?: 1;
      } = {};
      if (!mapFilter.type.includes('Supplies')) {
        unset.chestType = 1;
      }
      if (!mapFilter.hasLevel) {
        unset.level = 1;
      }
      if (!mapFilter.hasName) {
        unset.name = 1;
      }
      if (!mapFilter.hasCustomRespawnTimer) {
        unset.customRespawnTimer = 1;
      }
      if (!mapFilter.hasHP) {
        unset.hp = 1;
      }
      if (!marker.description) {
        unset.description = 1;
      }
      if (!marker.isTemporary) {
        unset.isTemporary = 1;
      }
      if (!marker.realm || !['live', 'ptr'].includes(marker.realm)) {
        unset.realm = 1;
      }
      const oldMarker = await getMarkersCollection().findOne(query);
      if (
        oldMarker?.screenshotFilename &&
        oldMarker.screenshotFilename !== marker.screenshotFilename
      ) {
        await getScreenshotsCollection().deleteOne({
          filename: oldMarker.screenshotFilename,
        });
        await fs
          .rm(`${SCREENSHOTS_PATH}/${oldMarker.screenshotFilename}`)
          .catch(() =>
            console.warn(
              `Could not remove screenshot ${oldMarker.screenshotFilename}`
            )
          );
      }

      if (!marker.screenshotFilename) {
        unset.screenshotFilename = 1;
      }

      marker.isPrivate = mapFilter.category === 'private';
      marker.updatedAt = new Date();
      const result = await getMarkersCollection().findOneAndUpdate(
        query,
        {
          $set: marker,
          $unset: unset,
        },
        { returnDocument: 'after', includeResultMetadata: true }
      );
      if (!result.ok || !result.value) {
        res.status(404).end(`No marker updated for id ${markerId}`);
        return;
      }

      await refreshMarkers();
      res.status(200).json(result.value);
      let nameType = marker.name
        ? `${marker.type} ${marker.name}`
        : marker.type;
      if (marker.size) {
        nameType += ` (${marker.size})`;
      }
      postToDiscord(
        `📌 ${nameType} was updated by ${account.name} at [${
          marker.position
        }]\n${getMarkerURL(result.value._id.toString(), result.value.map)}`,
        !marker.isPrivate,
        marker.realm
      );
    } catch (error) {
      next(error);
    }
  }
);

markersRouter.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const account = req.account!;

    const partialMarker = await bodyToMarker(req.body);
    if (!partialMarker || !partialMarker.type || !partialMarker.position) {
      res.status(400).send('Invalid payload');
      return;
    }
    const now = new Date();
    const marker: MarkerDTO = {
      createdAt: now,
      updatedAt: now,
      userId: account.steamId,
      username: account.name,
      type: partialMarker.type,
      position: partialMarker.position,
      ...partialMarker,
    };

    const existingMarker = await getMarkersCollection().findOne({
      type: marker.type,
      position: marker.position,
    });
    if (existingMarker) {
      res.status(409).send('Marker already exists');
      return;
    }
    if (marker.position) {
      const nearByMarker = await getMarkersCollection().findOne({
        type: marker.type,
        position: { $near: marker.position, $maxDistance: 0.5 },
      });
      if (nearByMarker) {
        res.status(409).send('A similar marker is too close');
        return;
      }
    }

    const mapFilter = mapFilters.find((filter) => filter.type === marker.type);
    if (!mapFilter) {
      res.status(400).send('Invalid filter type');
      return;
    }
    marker.isPrivate = mapFilter.category === 'private';
    const inserted = await getMarkersCollection().insertOne(marker);
    if (!inserted.acknowledged) {
      res.status(500).send('Error inserting marker');
      return;
    }
    await refreshMarkers();
    res.status(200).json(marker);
    let nameType = marker.name
      ? `${mapFilter.title} ${marker.name}`
      : mapFilter.title;
    if (marker.size) {
      nameType += ` (${marker.size})`;
    }
    postToDiscord(
      `📌 ${nameType} was added by ${account.name} at [${
        marker.position
      }]\n${getMarkerURL(inserted.insertedId.toString(), marker.map)}`,
      !marker.isPrivate,
      marker.realm
    );
  } catch (error) {
    console.error(`Error creating marker ${JSON.stringify(req.body)}`);
    next(error);
  }
});

markersRouter.post(
  '/:markerId/comments',
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const account = req.account!;
      const { markerId } = req.params;
      const { message, isIssue } = req.body;

      if (typeof message !== 'string' || !ObjectId.isValid(markerId)) {
        res.status(400).send('Invalid payload');
        return;
      }

      const comment: CommentDTO = {
        markerId: new ObjectId(markerId),
        userId: account.steamId,
        username: account.name,
        message,
        createdAt: new Date(),
        isIssue: Boolean(isIssue),
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

      const comments = await getCommentsCollection()
        .find({
          markerId: new ObjectId(markerId),
        })
        .toArray();

      await getMarkersCollection().updateOne(
        { _id: new ObjectId(markerId) },
        {
          $set: {
            comments: comments.filter((comment) => !comment.isIssue).length,
            issues: comments.filter((comment) => comment.isIssue).length,
          },
        }
      );

      await refreshMarkers();
      res.status(200).json(comment);
      const position = marker.position ? marker.position.join(', ') : 'unknown';
      if (comment.isIssue) {
        postToDiscord(
          `⚠️ ${account.name} added an issue for ${
            marker.type
          } at [${position}]:\n${comment.message}\n${getMarkerURL(
            markerId,
            marker.map
          )}`,
          !marker.isPrivate,
          marker.realm
        );
      } else {
        postToDiscord(
          `✍ ${account.name} added a comment for ${
            marker.type
          } at [${position}]:\n${comment.message}\n${getMarkerURL(
            markerId,
            marker.map
          )}`,
          !marker.isPrivate,
          marker.realm
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

async function bodyToMarker(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): Promise<Partial<MarkerDTO> | false> {
  const {
    type,
    map,
    realm,
    position,
    name,
    level,
    chestType,
    tier,
    size,
    description,
    screenshotId,
    screenshotFilename,
    customRespawnTimer,
    hp,
    requiredGlyphId,
    isTemporary,
  } = body;

  const marker: Partial<MarkerDTO> = {};
  if (
    typeof type === 'string' &&
    mapFilters.some((filter) => filter.type === type)
  ) {
    marker.type = type;
  }

  if (
    typeof map === 'string' &&
    !mapIsAeternumMap(map) &&
    findMapDetails(map)
  ) {
    marker.map = map;
  }
  if (typeof realm === 'string' && ['live', 'ptr'].includes(realm)) {
    marker.realm = realm;
  }
  if (Array.isArray(position) && position.length >= 2) {
    marker.position = position.map(
      (part: number) => new Double(part ? +part.toFixed(2) : 0)
    ) as [Double, Double, Double];
  }

  if (name) {
    marker.name = name.substring(0, MAX_NAME_LENGTH);
  }
  if (level) {
    marker.level = level;
  }
  if (chestType) {
    marker.chestType = chestType;
  }
  if (tier) {
    marker.tier = tier;
  }
  if (size) {
    marker.size = size;
  }
  if (typeof customRespawnTimer === 'number') {
    marker.customRespawnTimer = customRespawnTimer;
  }
  if (typeof hp === 'number') {
    marker.hp = hp;
  }
  if (typeof requiredGlyphId === 'number') {
    marker.requiredGlyphId = requiredGlyphId;
  }
  if (isTemporary === true) {
    marker.isTemporary = isTemporary;
  }

  if (description) {
    marker.description = description.substring(0, MAX_DESCRIPTION_LENGTH);
  }

  if (screenshotFilename) {
    marker.screenshotFilename = screenshotFilename;
  } else if (ObjectId.isValid(screenshotId)) {
    const screenshot = await getScreenshotsCollection().findOne({
      _id: new ObjectId(screenshotId),
    });
    if (screenshot) {
      marker.screenshotFilename = screenshot.filename;
    }
  }
  return marker;
}

export default markersRouter;
