import { Router } from 'express';
import type { Filter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { getMarkerRoutesURL, getMarkerURL, postToDiscord } from '../discord.js';
import { getMarkerRoutesCollection } from '../markerRoutes/collection.js';
import { getMarkersCollection } from '../markers/collection.js';
import { refreshMarkers } from '../markers/router.js';
import { getCommentsCollection } from './collection.js';
import type { CommentDTO } from './types.js';

const commentsRouter = Router();

commentsRouter.delete('/:commentId', ensureAuthenticated, async (req, res) => {
  const { commentId } = req.params;
  const account = req.account!;

  if (!ObjectId.isValid(commentId)) {
    res.status(400).send('Invalid payload');
    return;
  }

  const query: Filter<CommentDTO> = {
    _id: new ObjectId(commentId),
  };
  if (!account.isModerator) {
    query.userId = account.steamId;
  }

  const comment = await getCommentsCollection().findOne(query);
  if (!comment) {
    res.status(404).end(`No comment found ${commentId}`);
    return;
  }

  const result = await getCommentsCollection().deleteOne(query);
  if (!result.deletedCount) {
    res.status(404).end(`No comment found ${commentId}`);
    return;
  }

  if (comment.markerId) {
    const comments = await getCommentsCollection()
      .find({
        markerId: comment.markerId,
      })
      .toArray();

    await getMarkersCollection().updateOne(
      { _id: comment.markerId },
      {
        $set: {
          comments: comments.filter((comment) => !comment.isIssue).length,
          issues: comments.filter((comment) => comment.isIssue).length,
        },
      }
    );
    const marker = await getMarkersCollection().findOne({
      _id: comment.markerId,
    });
    if (!marker) {
      res.status(404).send("Marker doesn't exists");
      return;
    }
    await refreshMarkers();
    const position = marker.position.join(', ');

    if (comment.isIssue) {
      postToDiscord(
        `⚠️💀 ${account.name} deleted an issue for ${
          marker.type
        } at [${position}]:\n${comment.message}\n${getMarkerURL(
          marker._id.toString(),
          marker.map
        )}`,
        !marker.isPrivate
      );
    } else {
      postToDiscord(
        `✍💀 ${account.name} deleted a comment for ${
          marker.type
        } at [${position}]:\n${comment.message}\n${getMarkerURL(
          marker._id.toString(),
          marker.map
        )}`,
        !marker.isPrivate
      );
    }
  } else if (comment.markerRouteId) {
    const comments = await getCommentsCollection()
      .find({
        markerRouteId: comment.markerRouteId,
      })
      .toArray();

    await getMarkerRoutesCollection().updateOne(
      { _id: comment.markerRouteId },
      {
        $set: {
          comments: comments.filter((comment) => !comment.isIssue).length,
          issues: comments.filter((comment) => comment.isIssue).length,
        },
      }
    );

    const markerRoute = await getMarkerRoutesCollection().findOne({
      _id: comment.markerRouteId,
    });
    if (!markerRoute) {
      res.status(404).send("Route doesn't exists");
      return;
    }
    if (comment.isIssue) {
      postToDiscord(
        `⚠️💀 ${account.name} deleted an issue for route ${
          markerRoute.name
        }:\n${comment.message}\n${getMarkerRoutesURL(
          markerRoute._id.toString(),
          markerRoute.map
        )}`,
        markerRoute.isPublic
      );
    } else {
      postToDiscord(
        `✍💀 ${account.name} deleted a comment for route ${
          markerRoute.name
        }:\n${comment.message}\n${getMarkerRoutesURL(
          markerRoute._id.toString(),
          markerRoute.map
        )}`,
        markerRoute.isPublic
      );
    }
  }

  res.status(200).json({});
});

export default commentsRouter;
