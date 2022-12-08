import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db.js';
import type { InfluenceDTO } from './types.js';

export function getInfluencesCollection(): Collection<InfluenceDTO> {
  return getCollection<InfluenceDTO>('influences');
}

function ensureInfluencesIndexes(): Promise<string[]> {
  return getInfluencesCollection().createIndexes([
    { key: { worldName: 1 } },
    { key: { worldName: 1, createdAt: -1 } },
    { key: { worldName: 1, influence: 1, createdAt: -1 } },
  ]);
}

function ensureInfluencesSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'influences',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Influence',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          worldName: {
            bsonType: 'string',
          },
          userId: {
            bsonType: 'string',
          },
          username: {
            bsonType: 'string',
          },
          influence: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                regionName: {
                  bsonType: 'string',
                },
                factionName: {
                  bsonType: 'string',
                },
              },
              additionalProperties: false,
              required: ['regionName', 'factionName'],
            },
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: ['worldName', 'influence', 'createdAt'],
      },
    },
  });
}

export function initInfluencesCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureInfluencesIndexes(), ensureInfluencesSchema()]);
}
