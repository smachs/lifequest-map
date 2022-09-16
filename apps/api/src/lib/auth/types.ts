import type { ObjectId } from 'mongodb';

export type AccountDTO = {
  steamId: string;
  name: string;
  sessionIds: string[];
  isModerator?: boolean;
  favoriteRouteIds?: ObjectId[];
  liveShareToken?: string;
  liveShareServerUrl?: string;
  presets?: {
    name: string;
    types: string[];
  }[];
  createdAt: Date;
  hideAds?: boolean;
};
