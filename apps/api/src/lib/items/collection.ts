import type { Collection, Document } from 'mongodb';
import type { ItemDTO } from 'static';
import { getCollection, getDb } from '../db.js';

export function getItemsCollection(): Collection<ItemDTO> {
  return getCollection<ItemDTO>('items');
}

function ensureItemsIndexes() {
  return getItemsCollection().createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { markerIds: 1 } },
  ]);
}

function ensureItemsSchema(): Promise<Document> {
  return getDb().command({
    collMod: 'items',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Item',
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          id: {
            bsonType: 'string',
          },
          slug: {
            bsonType: 'string',
          },
          name: {
            bsonType: 'string',
          },
          rarity: {
            bsonType: 'string',
          },
          iconSrc: {
            bsonType: 'string',
          },
          minGearScore: {
            bsonType: 'int',
          },
          maxGearScore: {
            bsonType: 'int',
          },
          markerIds: {
            bsonType: 'array',
            items: {
              bsonType: 'string',
            },
          },
          unique: {
            bsonType: 'bool',
          },
          updatedAt: {
            bsonType: 'date',
          },
          createdAt: {
            bsonType: 'date',
          },
        },
        additionalProperties: false,
        required: [
          'id',
          'slug',
          'name',
          'rarity',
          'iconSrc',
          'minGearScore',
          'maxGearScore',
          'markerIds',
          'unique',
          'createdAt',
        ],
      },
    },
  });
}

export function initItemsCollection() {
  return Promise.all([ensureItemsIndexes(), ensureItemsSchema()]);
}
