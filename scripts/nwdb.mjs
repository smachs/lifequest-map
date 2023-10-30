import dotenv from 'dotenv';
import { Double, MongoClient } from 'mongodb';
dotenv.config();

import nwdbLocations from './nwdbLocations.json' assert { type: 'json' };
const TYPE = 'sporePodBeast';

const amMarkers = await fetch('https://aeternum-map.th.gl/api/markers').then(
  (resolve) => resolve.json()
);

const isNotNearBy = (node) => {
  return !amMarkers.some((marker) => {
    if (marker.type !== node.type) {
      return false;
    }
    const distance = Math.sqrt(
      Math.pow(marker.position[0] - node.position[0], 2) +
        Math.pow(marker.position[1] - node.position[1], 2)
    );
    return distance < 50;
  });
};

const now = new Date();

const coordinates = nwdbLocations.coordinates.filter((coordinates, index) => {
  const meta = nwdbLocations.meta[index];
  return meta.s === 'B';
});

const nwdbMarkers = coordinates.map((coordinates, index) => {
  const [x, y] = coordinates;
  return {
    position: [x, y],
    username: 'nwdb',
    createdAt: now,
    type: TYPE,
    // size: nwdbLocations.meta[index].s.toUpperCase(),
  };
});
const newMarkers = nwdbMarkers.filter(isNotNearBy);

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const markersCollection = client.db().collection('markers');

for (const node of newMarkers) {
  const normalizedNode = {
    ...node,
    position: node.position.map(Double),
  };
  const result = await markersCollection.updateOne(
    {
      type: normalizedNode.type,
      position: normalizedNode.position,
    },
    {
      $setOnInsert: {
        ...normalizedNode,
      },
    },
    {
      upsert: true,
    }
  );
  if (result.upsertedCount === 1) {
    console.log(`Insert ${node.type}`);
  }
}

await client.close();
