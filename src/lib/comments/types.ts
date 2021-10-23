import type { ObjectId } from 'mongodb';

export type CommentDTO = {
  markerId: ObjectId;
  username: string;
  message: string;
  createdAt: Date;
};
