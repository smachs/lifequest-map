import { Router } from 'express';
import { postToDiscord } from '../discord.js';
import { getUsersCollection } from './collection.js';
import { ObjectId } from 'mongodb';
import { getMarkerRoutesCollection } from '../markerRoutes/collection.js';
import { getMarkersCollection } from '../markers/collection.js';
import { getCommentsCollection } from '../comments/collection.js';
import type { UserDTO } from './types.js';

const usersRouter = Router();

const MAX_USERNAME_LENGTH = 50;
usersRouter.post('/', async (req, res, next) => {
  try {
    const account = req.account;

    const { username } = req.body;

    if (typeof username !== 'string' || username.length > MAX_USERNAME_LENGTH) {
      res.status(400).send('Invalid payload');
      return;
    }

    const existingUser = await getUsersCollection().findOne({ username });
    if (existingUser) {
      if (!existingUser.accountId && account) {
        // Migrate to new account
        await getUsersCollection().updateOne(
          { username },
          { $set: { accountId: account.steamId }, $unset: { isModerator: 1 } }
        );

        await getMarkerRoutesCollection().updateMany(
          {
            userId: { $exists: false },
            username: existingUser.username,
          },
          {
            $set: {
              userId: account.steamId,
              username: account.name,
            },
          }
        );
        await getMarkersCollection().updateMany(
          {
            userId: { $exists: false },
            username: existingUser.username,
          },
          {
            $set: {
              userId: account.steamId,
              username: account.name,
            },
          }
        );
        await getCommentsCollection().updateMany(
          {
            userId: { $exists: false },
            username: existingUser.username,
          },
          {
            $set: {
              userId: account.steamId,
              username: account.name,
            },
          }
        );
      }

      res.status(200).json(existingUser);
      return;
    }
    const setOnInsert: Partial<UserDTO> = {
      username,
      hiddenMarkerIds: [],
      createdAt: new Date(),
    };
    if (account?.steamId) {
      setOnInsert.accountId = account.steamId;
    }

    const result = await getUsersCollection().findOneAndUpdate(
      { username },
      {
        $setOnInsert: setOnInsert,
      },
      { upsert: true, returnDocument: 'after' }
    );
    const user = result.value;
    if (user) {
      res.status(200).json(user);
      postToDiscord(`🤘 ${user.username} is using Aeternum Map`, false);
    } else {
      throw new Error('Could not create user');
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const { hiddenMarkerIds } = req.body;
    if (!Array.isArray(hiddenMarkerIds)) {
      res.status(400).send('Invalid payload');
      return;
    }
    const hiddenMarkerObjectIds = hiddenMarkerIds.map(
      (markerId: string) => new ObjectId(markerId)
    );

    const result = await getUsersCollection().updateOne(
      { username },
      {
        $set: {
          hiddenMarkerIds: hiddenMarkerObjectIds,
        },
      }
    );
    if (!result.modifiedCount) {
      res.status(400).end(`No change`);
      return;
    }
    res.status(200).json(hiddenMarkerIds);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
