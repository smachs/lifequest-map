import { Router } from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import { Blob } from 'node-fetch';
import sharp from 'sharp';
import { validateInfluence, worlds } from 'static';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { uploadToDiscord } from '../discord.js';
import { SCREENSHOTS_PATH } from '../env.js';
import { getInfluencesCollection } from '../influences/collection.js';
import { getScreenshotsCollection } from './collection.js';

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
      const account = req.account!;

      if (!req.file || !req.body.worldName || !req.body.influence) {
        res.status(400).send('Invalid payload');
        return;
      }
      const world = worlds.find(
        (world) => world.worldName === req.body.worldName
      );
      if (!world) {
        res.status(404).send(`Can not find ${req.body.worldName}`);
        return;
      }

      const influence = JSON.parse(req.body.influence) as {
        regionName: string;
        factionName: string;
      }[];
      validateInfluence(influence);

      const buffer = await sharp(req.file.path).webp().toBuffer();
      const blob = new Blob([buffer]);
      await fs.rm(req.file.path);
      const now = new Date();

      const lastInfluence = await getInfluencesCollection().findOne(
        {
          worldName: world.worldName,
        },
        {
          sort: {
            createdAt: -1,
          },
        }
      );

      const changedInfluence = influence.reduce<
        { regionName: string; before: string; after: string }[]
      >((pre, item) => {
        const previousItem = lastInfluence
          ? lastInfluence.influence.find(
              (lastItem) =>
                lastItem.regionName === item.regionName &&
                lastItem.factionName !== item.factionName
            )
          : { regionName: item.regionName, factionName: 'Neutral' };
        if (previousItem) {
          return [
            ...pre,
            {
              regionName: item.regionName,
              before: previousItem.factionName,
              after: item.factionName,
            },
          ];
        }
        return pre;
      }, []);

      const insertResult = await getInfluencesCollection().insertOne({
        worldName: world.worldName,
        influence,
        userId: account.steamId,
        username: account.name,
        createdAt: now,
      });
      if (!insertResult.acknowledged) {
        res.status(500).send('Could not insert influence');
        return;
      }

      const webhookUrl =
        process.env[
          `DISCORD_${world.publicName
            .toUpperCase()
            .replaceAll(' ', '')}_WEBHOOK_URL`
        ];

      if (!webhookUrl || changedInfluence.length === 0) {
        res.status(200).json({ message: 'Influence added without change' });
        return;
      }

      const changedInfluenceMessage = changedInfluence
        .map((item) => `${item.regionName}: ${item.before} -> ${item.after}`)
        .join('\n');
      const response = await uploadToDiscord(
        blob,
        `**Server**: ${world.publicName}\n**User**: ${
          account.name
        }\n**Date**: ${now.toLocaleDateString()}\n**Changes**:\n${changedInfluenceMessage}`,
        webhookUrl
      );
      const result = await response.json();
      res.status(response.status).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default screenshotsRouter;
