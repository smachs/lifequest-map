import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db.js';
import type { CommentDTO } from './types.js';

export function getCommentsCollection(): Collection<CommentDTO> {
  return getCollection<CommentDTO>('comments');
}

function ensureCommentsIndexes(): Promise<string[]> {
  return getCommentsCollection().createIndexes([
    { key: { markerId: 1 } },
    { key: { markerRouteId: 1 } },
  ]);
}

function ensureCommentsSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'comments',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Comment',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          markerId: {
            bsonType: 'objectId',
          },
          markerRouteId: {
            bsonType: 'objectId',
          },
          userId: {
            bsonType: 'string',
          },
          username: {
            bsonType: 'string',
          },
          message: {
            bsonType: 'string',
          },
          createdAt: {
            bsonType: 'date',
          },
          isIssue: {
            bsonType: 'bool',
          },
        },
        additionalProperties: false,
        required: ['username', 'message', 'createdAt'],
      },
    },
  });
}

export function initCommentsCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureCommentsIndexes(), ensureCommentsSchema()]);
}
