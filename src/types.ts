import type { Double, ObjectId } from 'mongodb';

export type Marker = {
  type: string;
  position?: [Double, Double, Double];
  positions?: [Double, Double][];
  name?: string;
  level?: number;
  description?: string;
  levelRange?: [number, number];
  username: string;
  screenshotFilename?: string;
  comments?: number;
  createdAt: Date;
};

export type Comment = {
  markerId: ObjectId;
  username: string;
  message: string;
  createdAt: Date;
};

export type User = {
  username: string;
  hiddenMarkerIds: ObjectId[];
  createdAt: Date;
};
