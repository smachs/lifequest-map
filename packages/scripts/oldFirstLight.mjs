/**
 * This script is used to convert nodes in Brimstone Sands from https://www.newworld-map.com/.
 * StudioLoot approved the usage, if we credit them.
 */

import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import regions from '../packages/static/src/regions.json' assert { type: 'json' };
dotenv.config();

const markers = await fetch('https://aeternum-map.th.gl/api/markers').then(
  (resolve) => resolve.json()
);
const region = regions.find((region) => region.name === 'Elysian Wilds');

const checkPointInsidePolygon = (point, polygon) => {
  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

const inRegion = (node) => {
  return checkPointInsidePolygon(
    [node.position[1], node.position[0]],
    region.coordinates
  );
};

const regionMarkers = markers.filter(inRegion);
console.log(regionMarkers.length + ' markers in region');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const markersCollection = client.db().collection('markers');

for (const marker of regionMarkers) {
  const result = await markersCollection.deleteOne({
    _id: new ObjectId(marker._id),
  });
  if (result.deletedCount === 1) {
    console.log(`Deleted ${marker.type}`);
  }
}

await client.close();
