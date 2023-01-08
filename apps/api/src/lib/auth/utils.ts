import type { Filter, UpdateFilter } from 'mongodb';
import { getCommentsCollection } from '../comments/collection.js';
import { getInfluencesCollection } from '../influences/collection.js';
import { getMarkerRoutesCollection } from '../markerRoutes/collection.js';
import { getMarkersCollection } from '../markers/collection.js';

type UserDTO = { userId: string; username: string };
export const updateUsername = (userId: string, username: string) => {
  const filter: Filter<UserDTO> = { userId, username: { $ne: username } };
  const update: UpdateFilter<UserDTO> = { $set: { username } };

  //@ts-ignore
  getMarkersCollection().updateMany(filter, update);
  getMarkerRoutesCollection().updateMany(filter, update);
  getCommentsCollection().updateMany(filter, update);
  getInfluencesCollection().updateMany(filter, update);
};
