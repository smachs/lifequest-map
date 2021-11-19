import type { ObjectId } from 'mongodb';

export type AccountDTO = {
  steamId: string;
  name: string;
  sessionIds: string[];
  isModerator?: boolean;
  favoriteRouteIds?: ObjectId[];
  createdAt: Date;
};
