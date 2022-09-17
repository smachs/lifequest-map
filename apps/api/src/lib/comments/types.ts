import type { ObjectId } from 'mongodb';

export type CommentDTO = {
  markerId: ObjectId;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
  isIssue?: boolean;
};
