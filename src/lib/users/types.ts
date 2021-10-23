import type { ObjectId } from 'mongodb';

export type UserDTO = {
  username: string;
  hiddenMarkerIds: ObjectId[];
  createdAt: Date;
  isModerator?: boolean;
};
