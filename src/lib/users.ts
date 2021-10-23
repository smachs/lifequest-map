import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from './db';
import type { User } from '../types';

export function getUsersCollection(): Collection<User> {
  return getCollection<User>('users');
}

export function ensureUsersIndexes(): Promise<string[]> {
  return getUsersCollection().createIndexes([{ key: { username: 1 } }], {
    unique: true,
  });
}

export function ensureUsersSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'users',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'User',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          username: {
            bsonType: 'string',
          },
          hiddenMarkerIds: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
          isModerator: {
            bsonType: 'bool',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: ['username', 'createdAt'],
      },
    },
  });
}
