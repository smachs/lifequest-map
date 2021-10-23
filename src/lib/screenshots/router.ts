import { Router } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import multer from 'multer';
import { SCREENSHOTS_PATH } from '../env';

const screenshotsUpload = multer({ dest: SCREENSHOTS_PATH });

const screenshotsRouter = Router();

screenshotsRouter.post(
  '/',
  screenshotsUpload.single('screenshot'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send('Invalid payload');
        return;
      }
      const filePath = `${req.file.path}.webp`;
      await sharp(req.file.path).webp().toFile(filePath);
      await fs.rm(req.file.path);
      res.json({
        filename: `${req.file.filename}.webp`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default screenshotsRouter;
