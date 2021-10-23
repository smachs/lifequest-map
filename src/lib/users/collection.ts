import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db';
import type { UserDTO } from './types';

export function getUsersCollection(): Collection<UserDTO> {
  return getCollection<UserDTO>('users');
}

function ensureUsersIndexes(): Promise<string[]> {
  return getUsersCollection().createIndexes([{ key: { username: 1 } }], {
    unique: true,
  });
}

function ensureUsersSchema(): Promise<Document> {
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

export function initUsersCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureUsersIndexes(), ensureUsersSchema()]);
}
