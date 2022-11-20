import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db.js';
import type { SupporterDTO } from './types.js';

export function getSupportersCollection(): Collection<SupporterDTO> {
  return getCollection<SupporterDTO>('supporters');
}

function ensureSupportersIndexes(): Promise<string[]> {
  return getSupportersCollection().createIndexes([
    { key: { patronId: 1 } },
    { key: { steamId: 1 } },
    { key: { secret: 1 }, unique: true },
  ]);
}

function ensureSupportersSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'supporters',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Supporter',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          steamId: {
            bsonType: 'string',
          },
          patronId: {
            bsonType: 'string',
          },
          secret: {
            bsonType: 'string',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: ['secret', 'createdAt'],
      },
    },
  });
}

export function initSupportersCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureSupportersIndexes(), ensureSupportersSchema()]);
}
