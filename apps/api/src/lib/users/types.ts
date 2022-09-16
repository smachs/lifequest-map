import type { ObjectId } from 'mongodb';

export type UserDTO = {
  username: string;
  accountId?: string;
  hiddenMarkerIds: ObjectId[];
  createdAt: Date;
};
