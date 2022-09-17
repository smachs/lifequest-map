import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db.js';
import type { AccountDTO } from './types.js';

export function getAccountCollection(): Collection<AccountDTO> {
  return getCollection<AccountDTO>('accounts');
}

function ensureAccountsIndexes(): Promise<string[]> {
  return getAccountCollection().createIndexes([
    { key: { steamId: 1 }, unique: true },
    { key: { sessionId: 1 } },
  ]);
}

function ensureAccountsSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'accounts',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Account',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          steamId: {
            bsonType: 'string',
          },
          name: {
            bsonType: 'string',
          },
          sessionIds: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
            },
          },
          isModerator: {
            bsonType: 'bool',
          },
          hideAds: {
            bsonType: 'bool',
          },
          favoriteRouteIds: {
            bsonType: 'array',
            items: {
              bsonType: 'objectId',
            },
          },
          liveShareToken: {
            bsonType: 'string',
          },
          liveShareServerUrl: {
            bsonType: 'string',
          },
          presets: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                name: {
                  bsonType: 'string',
                },
                types: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'string',
                  },
                },
              },
            },
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: ['steamId', 'name', 'createdAt'],
      },
    },
  });
}

export function initAccountsCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureAccountsIndexes(), ensureAccountsSchema()]);
}
