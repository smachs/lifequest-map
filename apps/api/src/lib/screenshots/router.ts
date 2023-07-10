import { Router } from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import { Blob } from 'node-fetch';
import sharp from 'sharp';
import type { Faction } from 'static';
import { ICONS, validateInfluence, worlds } from 'static';
import { ensureAuthenticated } from '../auth/middlewares.js';
import { uploadToDiscord } from '../discord.js';
import { SCREENSHOTS_PATH } from '../env.js';
import { getInfluencesCollection } from '../influences/collection.js';
import { generateInfluenceSVG } from '../influences/utils.js';
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

      const screenshotBuffer = await sharp(req.file.path).webp().toBuffer();
      const screenshotBlob = new Blob([screenshotBuffer]);
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
        { regionName: string; before: Faction; after: Faction }[]
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
              before: previousItem.factionName as Faction,
              after: item.factionName as Faction,
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

      if (changedInfluence.length === 0) {
        res.status(200).json({ message: 'Influence added without change' });
        return;
      }

      const changedInfluenceMessage = changedInfluence
        .map(
          (item) =>
            `${item.regionName}: ${ICONS[item.before]} -> ${ICONS[item.after]}`
        )
        .join('\n');
      const ranking: {
        [factionName: string]: number;
      } = {
        Syndicate: 0,
        Covenant: 0,
        Marauder: 0,
      };
      influence.forEach(({ factionName }) => {
        if (typeof ranking[factionName] !== 'undefined') {
          ranking[factionName]++;
        }
      });
      const total = ranking.Syndicate + ranking.Covenant + ranking.Marauder;
      const syndicatePart = ((ranking.Syndicate / total) * 100).toFixed(0);
      const covenantPart = ((ranking.Covenant / total) * 100).toFixed(0);
      const marauderPart = ((ranking.Marauder / total) * 100).toFixed(0);

      const svg = await generateInfluenceSVG(world.worldName, influence);
      const buffer = await sharp(Buffer.from(svg)).webp().toBuffer();

      const svgBlob = new Blob([buffer]);

      const WEBHOOK_URLS = JSON.parse(
        process.env.DISCORD_WEBHOOK_URLS || '[]'
      ) as [string, string][];
      const webhookUrls = WEBHOOK_URLS.filter(
        (url) =>
          url[0] ===
          world.publicName.toUpperCase().replaceAll(' ', '').replaceAll('-', '')
      ).map((url) => url[1]);
      for (const webhookUrl of webhookUrls) {
        try {
          const response = await uploadToDiscord(
            [screenshotBlob, svgBlob],
            `
  **Source**: [aeternum-map.gg](<https://aeternum-map.gg/influences/${encodeURIComponent(
    world.publicName
  )}>)
  **Server**: ${world.publicName}
  **User**: ${account.name}
  **Date**: ${now.toLocaleDateString()}
  **Changes**:
  ${changedInfluenceMessage}
  **Influence**: ${ICONS.Covenant} ${covenantPart}% | ${
              ICONS.Marauder
            } ${marauderPart}% | ${ICONS.Syndicate} ${syndicatePart}%
  `,
            webhookUrl
          );
          await response.json();
        } catch (error) {
          console.error(error);
        }
      }
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default screenshotsRouter;
