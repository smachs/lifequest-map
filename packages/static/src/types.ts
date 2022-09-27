import type { Double } from 'mongodb';

export type MarkerSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '?';
export type MarkerDTO = {
  type: string;
  map?: string;
  position: [Double, Double, Double];
  name?: string;
  level?: number;
  chestType?: string;
  tier?: number;
  size?: MarkerSize;
  description?: string;
  userId?: string;
  username: string;
  screenshotFilename?: string;
  comments?: number;
  issues?: number;
  isPrivate?: boolean;
  updatedAt?: Date;
  createdAt: Date;
};

export type ItemDTO = {
  id: string;
  name: string;
  rarity: string;
  iconSrc: string;
  minGearScore: number;
  maxGearScore: number;
  markerIds: string[];
  updatedAt?: Date;
  createdAt: Date;
};
