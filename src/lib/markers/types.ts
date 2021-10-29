import type { Double } from 'mongodb';

export type MarkerDTO = {
  type: string;
  position: [Double, Double, Double];
  name?: string;
  level?: number;
  description?: string;
  levelRange?: [number, number];
  userId?: string;
  username: string;
  screenshotFilename?: string;
  comments?: number;
  createdAt: Date;
};
