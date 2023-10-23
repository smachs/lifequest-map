import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from '../db.js';
import type { MarkerRouteDTO } from './types.js';

export function getMarkerRoutesCollection(): Collection<MarkerRouteDTO> {
  return getCollection<MarkerRouteDTO>('marker-routes');
}

function ensureMarkerRoutesIndexes(): Promise<string[]> {
  return getMarkerRoutesCollection().createIndexes([
    { key: { username: 1, name: 1 }, unique: true },
    { key: { isPublic: 1 } },
    { key: { username: 1 } },
    { key: { userId: 1 } },
  ]);
}

function ensureMarkerRoutesSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'marker-routes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Marker Route',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          name: {
            bsonType: 'string',
          },
          description: {
            bsonType: 'string',
          },
          map: {
            bsonType: 'string',
          },
          userId: {
            bsonType: 'string',
          },
          username: {
            bsonType: 'string',
          },
          isPublic: {
            bsonType: 'bool',
          },
          favorites: {
            bsonType: 'int',
          },
          forks: {
            bsonType: 'int',
          },
          origin: {
            bsonType: 'objectId',
          },
          positions: {
            bsonType: 'array',
            items: {
              bsonType: 'array',
              items: {
                bsonType: 'double',
              },
            },
          },
          texts: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                position: {
                  bsonType: 'array',
                  items: {
                    bsonType: 'double',
                  },
                },
                text: {
                  bsonType: 'string',
                },
              },
              additionalProperties: false,
              required: ['position', 'text'],
            },
          },
          regions: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
            },
          },
          markersByType: {
            bsonType: 'object',
          },
          createdAt: {
            bsonType: 'date',
          },
          updatedAt: {
            bsonType: 'date',
          },
          lastUsedAt: {
            bsonType: 'date',
          },
          usageCount: {
            bsonType: 'int',
          },
          usage: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                lastUsedAt: {
                  bsonType: 'date',
                },
                userId: {
                  bsonType: 'string',
                },
              },
              additionalProperties: false,
              required: ['lastUsedAt', 'userId'],
            },
          },
          comments: {
            bsonType: 'int',
          },
          issues: {
            bsonType: 'int',
          },
        },
        additionalProperties: false,
        required: [
          'name',
          'userId',
          'username',
          'positions',
          'isPublic',
          'markersByType',
          'createdAt',
          'updatedAt',
        ],
      },
    },
  });
}

export function initMarkerRoutesCollection(): Promise<[string[], Document]> {
  return Promise.all([ensureMarkerRoutesIndexes(), ensureMarkerRoutesSchema()]);
}
