/**
 * This script is used to convert rabbits from https://www.newworld-map.com/.
 * StudioLoot approved the usage, if we credit them.
 */

import dotenv from 'dotenv';
import { Double, MongoClient } from 'mongodb';
dotenv.config();

const nwmMarkers = await fetch(
  'https://www.newworld-map.com/markers.json'
).then((resolve) => resolve.json());
const amMarkers = await fetch('https://aeternum-map.gg/api/markers').then(
  (resolve) => resolve.json()
);
const amRabbits = amMarkers.filter((marker) => marker.type === 'rabbit');

const isNotNearByOtherRabbit = (node) => {
  return !amRabbits.some((rabbit) => {
    const distance = Math.sqrt(
      Math.pow(rabbit.position[0] - node.position[0], 2) +
        Math.pow(rabbit.position[1] - node.position[1], 2)
    );
    return distance < 100;
  });
};

const toNode = (props) => (node) => ({
  position: [node.x, node.y],
  username: 'newworld-map',
  createdAt: new Date(),
  ...props,
});

const nwmRabbits = Object.values(nwmMarkers.monsters.rabbit).map(
  toNode({ type: 'rabbit' })
);
const rabbits = nwmRabbits.filter(isNotNearByOtherRabbit);

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const markersCollection = client.db().collection('markers');

for (const node of rabbits) {
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
