import type { Collection, Document } from 'mongodb';
import { getCollection, getDb } from './db';
import type { MarkerRoute } from '../types';

export function getMarkerRoutesCollection(): Collection<MarkerRoute> {
  return getCollection<MarkerRoute>('marker-routes');
}

export function ensureMarkerRoutesIndexes(): Promise<string[]> {
  return getMarkerRoutesCollection().createIndexes([{ key: { name: 1 } }]);
}

export function ensureMarkerRoutesSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'marker-routes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Comment',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          name: {
            bsonType: 'string',
          },
          username: {
            bsonType: 'string',
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
          markersByType: {
            bsonType: 'object',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: [
          'name',
          'username',
          'positions',
          'markersByType',
          'createdAt',
        ],
      },
    },
  });
}
