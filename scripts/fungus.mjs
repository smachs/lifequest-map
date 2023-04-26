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

const toNode = (props) => (node) => ({
  position: [node.x, node.y],
  username: 'newworld-map',
  createdAt: new Date(),
  ...props,
});

const nodes = [
  ...Object.values(nwmMarkers.plants.pigment_plant_brown).map(
    toNode({ type: 'bumbleblossom' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_cyan).map(
    toNode({ type: 'capped_tanglewisp' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_white).map(
    toNode({ type: 'cascaded_gillflower' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_red).map(
    toNode({ type: 'corrupted_bloodspore' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_green_light).map(
    toNode({ type: 'fronded_petalcap' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_tan).map(
    toNode({ type: 'slimy_twistcap' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_green_dark).map(
    toNode({ type: 'spinecap' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_yellow).map(
    toNode({ type: 'suncreeper' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_blue_light).map(
    toNode({ type: 'tanglewisp' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_pink).map(
    toNode({ type: 'tendrilspine' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_blue_dark).map(
    toNode({ type: 'toadpot' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_black).map(
    toNode({ type: 'void_pitcher' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_orange).map(
    toNode({ type: 'warm_platecap' })
  ),
  ...Object.values(nwmMarkers.plants.pigment_plant_magenta).map(
    toNode({ type: 'weeping_shellbed' })
  ),
];

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const markersCollection = client.db().collection('markers');

for (const node of nodes) {
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
