import { Router } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import multer from 'multer';
import { SCREENSHOTS_PATH } from '../env.js';
import { getScreenshotsCollection } from './collection.js';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { uploadToDiscord } from '../discord.js';
import { worlds } from 'static';

const screenshotsUpload = multer({ dest: SCREENSHOTS_PATH });

const screenshotsRouter = Router();

screenshotsRouter.post(
  '/',
  screenshotsUpload.single('screenshot'),
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send('Invalid payload');
        return;
      }

      const filePath = `${req.file.path}.webp`;
      await sharp(req.file.path).webp().toFile(filePath);
      await fs.rm(req.file.path);

      const screenshot = await getScreenshotsCollection().insertOne({
        filename: `${req.file.filename}.webp`,
        createdAt: new Date(),
      });

      res.json({
        screenshotId: screenshot.insertedId,
      });
    } catch (error) {
      next(error);
    }
  }
);

screenshotsRouter.post(
  '/influences',
  screenshotsUpload.single('screenshot'),
  ensureAuthenticated,
  async (req, res, next) => {
    try {
      const worldName = req.body.worldName;
      if (!req.file || !worldName) {
        res.status(400).send('Invalid payload');
        return;
      }
      const world = worlds.find((world) => world.worldName === worldName);
      if (!world) {
        res.status(404).send(`Can not find ${worldName}`);
        return;
      }
      const buffer = await sharp(req.file.path).webp().toBuffer();
      await fs.rm(req.file.path);

      const response = await uploadToDiscord(
        buffer,
        `Server: ${world.publicName}`
      );
      const result = await response.json();
      res.status(response.status).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default screenshotsRouter;
