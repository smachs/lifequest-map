import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db';
import type { AccountDTO } from './types';

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
          sessionId: {
            bsonType: 'string',
          },
          isModerator: {
            bsonType: 'bool',
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
