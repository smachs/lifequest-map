import { Router } from 'express';
import { postToDiscord } from '../discord';
import { getUsersCollection } from './collection';

const usersRouter = Router();

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username } = req.body;

    if (typeof username !== 'string') {
      res.status(400).send('Invalid payload');
      return;
    }

    const existingUser = await getUsersCollection().findOne({ username });
    if (existingUser) {
      res.status(200).json(existingUser);
      return;
    }
    const result = await getUsersCollection().findOneAndUpdate(
      { username },
      {
        $setOnInsert: {
          username,
          hiddenMarkerIds: [],
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    if (result.value) {
      res.status(200).json(result.value);
      postToDiscord(`🤘 ${result.value.username} is using Aeternum Map`);
    } else {
      throw new Error('Could not create user');
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await getUsersCollection().findOne({ username });
    if (!user) {
      res.status(404).end(`No user found for ${username}`);
      return;
    }
    res.status(200).json(user);
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

    const result = await getUsersCollection().updateOne(
      { username },
      {
        $set: {
          hiddenMarkerIds,
        },
      }
    );
    if (!result.modifiedCount) {
      res.status(404).end(`No user found for ${username}`);
      return;
    }
    res.status(200).json(hiddenMarkerIds);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
