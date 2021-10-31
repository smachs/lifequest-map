import type { ObjectId } from 'mongodb';

export type AccountDTO = {
  steamId: string;
  name: string;
  sessionId: string;
  isModerator?: boolean;
  favoriteRouteIds?: ObjectId[];
  createdAt: Date;
};
