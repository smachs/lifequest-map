import type { Double } from 'mongodb';

export type MarkerSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '?';
export type MarkerDTO = {
  vitalsID?: string;
  type: string;
  map?: string;
  realm?: string;
  position: [Double, Double];
  name?: string;
  level?: number;
  levels?: number[];
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
  customRespawnTimer?: number;
  hp?: number;
  requiredGlyphId?: number;
  isTemporary?: boolean;
  updatedAt?: Date;
  createdAt: Date;
};

export type ItemDTO = {
  id: string;
  name: string;
  slug: string;
  rarity: string;
  iconSrc: string;
  gearScore: number;
  minGearScore: number;
  maxGearScore: number;
  markerIds: string[];
  unique: boolean;
  updatedAt?: Date;
  createdAt: Date;
};

export type MarkerFull = {
  vitalsID?: string;
  type: string;
  position: [number, number, number];
  name?: string;
  map?: string;
  realm?: string;
  level?: number;
  levels?: number[];
  hp?: number;
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  userId?: string;
  username?: string;
  comments?: number;
  chestType?: string;
  tier?: number;
  requiredGlyphId?: number;
  isTemporary?: boolean;
  customRespawnTimer?: number;
  _id: string;
};
