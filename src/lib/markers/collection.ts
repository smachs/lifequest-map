import type { Collection, Document } from 'mongodb';
import type { MarkerDTO } from './types';
import { getCollection, getDb } from '../db';

export function getMarkersCollection(): Collection<MarkerDTO> {
  return getCollection<MarkerDTO>('markers');
}

function ensureMarkersIndexes(): Promise<[string[], string[], string[]]> {
  return Promise.all([
    getMarkersCollection().createIndexes([{ key: { type: 1, position: 1 } }], {
      unique: true,
    }),
    getMarkersCollection().createIndexes([{ key: { createdAt: -1 } }]),
    getMarkersCollection().createIndexes([
      { key: { position: '2d' }, min: 0, max: 14336 },
    ]),
  ]);
}

function ensureMarkersSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'markers',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Marker',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          type: {
            bsonType: 'string',
          },
          position: {
            bsonType: 'array',
            items: {
              bsonType: 'double',
            },
          },
          name: {
            bsonType: 'string',
          },
          level: {
            bsonType: 'int',
          },
          levelRange: {
            bsonType: 'array',
            items: {
              bsonType: 'int',
            },
          },
          description: {
            bsonType: 'string',
          },
          userId: {
            bsonType: 'string',
          },
          username: {
            bsonType: 'string',
          },
          screenshotFilename: {
            bsonType: 'string',
          },
          comments: {
            bsonType: 'int',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: ['type', 'position', 'createdAt'],
      },
    },
  });
}

export function initMarkersCollection(): Promise<
  [[string[], string[], string[]], Document]
> {
  return Promise.all([ensureMarkersIndexes(), ensureMarkersSchema()]);
}
