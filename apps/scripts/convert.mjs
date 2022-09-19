/**
 * This script is used to convert nodes in Brimstone Sands from https://www.newworld-map.com/.
 * StudioLoot approved the usage, if we credit them.
 */

import loreTitles from './lore_titles.json' assert { type: 'json' };
import regions from '../../packages/static/src/regions.json' assert { type: 'json' };
import { Double, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const markers = await fetch('https://www.newworld-map.com/markers.json').then(
  (resolve) => resolve.json()
);
const brimstoneSandsRegion = regions.find(
  (region) => region.name === 'Brimstone Sands'
);

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

const inBrimstoneSands = (node) => {
  return checkPointInsidePolygon(
    [node.position[1], node.position[0]],
    brimstoneSandsRegion.coordinates
  );
};

const toNode = (props) => (node) => ({
  position: [node.x, node.y],
  username: 'newworld-map',
  createdAt: new Date(),
  ...props,
});

const allNodes = [
  ...Object.values(markers.woods.ironwood).map(
    toNode({ type: 'ironwood', size: '?' })
  ),
  ...Object.values(markers.woods.wyrdwood).map(
    toNode({ type: 'wyrdwood', size: '?' })
  ),
  ...Object.values(markers.fishing.hotspot_broad).map(
    toNode({ type: 'fish_hotspot1' })
  ),
  ...Object.values(markers.fishing.hotspot_rare).map(
    toNode({ type: 'fish_hotspot2' })
  ),
  ...Object.values(markers.fishing.hotspot_secret).map(
    toNode({ type: 'fish_hotspot3' })
  ),
  ...Object.values(markers.essences.air_boid).map(
    toNode({ type: 'essences_lightning_beetle' })
  ),
  ...Object.values(markers.essences.air_plant).map(
    toNode({ type: 'essences_shockbulb' })
  ),
  ...Object.values(markers.essences.air_stone).map(
    toNode({ type: 'essences_shockspire' })
  ),
  ...Object.values(markers.essences.death_boid).map(
    toNode({ type: 'essences_blightmoth' })
  ),
  ...Object.values(markers.essences.death_plant).map(
    toNode({ type: 'essences_blightroot' })
  ),
  ...Object.values(markers.essences.death_stone).map(
    toNode({ type: 'essences_blightcrag' })
  ),
  ...Object.values(markers.essences.fire_boid).map(
    toNode({ type: 'essences_salamander_snail' })
  ),
  ...Object.values(markers.essences.fire_plant).map(
    toNode({ type: 'essences_dragonglory' })
  ),
  ...Object.values(markers.essences.fire_stone).map(
    toNode({ type: 'essences_scorchstone' })
  ),
  ...Object.values(markers.essences.life_boid).map(
    toNode({ type: 'essences_lifemoth' })
  ),
  ...Object.values(markers.essences.life_plant).map(
    toNode({ type: 'essences_lifebloom' })
  ),
  ...Object.values(markers.essences.life_stone).map(
    toNode({ type: 'essences_lifejewel' })
  ),
  ...Object.values(markers.essences.soul_boid).map(
    toNode({ type: 'essences_soulwyrm' })
  ),
  ...Object.values(markers.essences.soul_plant).map(
    toNode({ type: 'essences_soulsprout' })
  ),
  ...Object.values(markers.essences.soul_stone).map(
    toNode({ type: 'essences_soulspire' })
  ),
  ...Object.values(markers.essences.water_boid).map(
    toNode({ type: 'essences_floating_spinefish' })
  ),
  ...Object.values(markers.essences.water_plant).map(
    toNode({ type: 'essences_rivercress' })
  ),
  ...Object.values(markers.essences.water_stone).map(
    toNode({ type: 'essences_springstone' })
  ),
  ...Object.values(markers.ores.gold).map(toNode({ type: 'gold', size: '?' })),
  ...Object.values(markers.ores.iron).map(toNode({ type: 'iron', size: '?' })),
  ...Object.values(markers.ores.lodestone).map(
    toNode({ type: 'lodestone', size: '?' })
  ),
  ...Object.values(markers.ores.orichalcum).map(
    toNode({ type: 'orichalcum', size: '?' })
  ),
  ...Object.values(markers.ores.platinium).map(
    toNode({ type: 'platinum', size: '?' })
  ),
  ...Object.values(markers.ores.saltpeter).map(
    toNode({ type: 'saltpeter', size: '?' })
  ),
  ...Object.values(markers.ores.sandstone).map(
    toNode({ type: 'sandstone', size: '?' })
  ),
  ...Object.values(markers.ores.seeping_stone).map(
    toNode({ type: 'oil', size: '?' })
  ),
  ...Object.values(markers.ores.silver).map(
    toNode({ type: 'silver', size: '?' })
  ),
  ...Object.values(markers.ores.starmetal).map(
    toNode({ type: 'starmetal', size: '?' })
  ),
  ...Object.values(markers.plants.azoth_water).map(
    toNode({ type: 'azoth_spring' })
  ),
  ...Object.values(markers.plants.hemp).map(
    toNode({ type: 'hemp', size: '?' })
  ),
  ...Object.values(markers.plants.herb).map(
    toNode({ type: 'herb', size: '?' })
  ),
  ...Object.values(markers.plants.hemp_t4).map(
    toNode({ type: 'silkweed', size: '?' })
  ),
  ...Object.values(markers.plants.hemp_t5).map(
    toNode({ type: 'wirefiber', size: '?' })
  ),
  ...Object.values(markers.plants.dye_plant_desertrose).map(
    toNode({ type: 'pigment_desert_rose_primsabloom' })
  ),
  ...Object.values(markers.plants.PricklyPearCactus).map(
    toNode({ type: 'pricklyPearCactus' })
  ),
  ...Object.values(markers.chests.al1).map(
    toNode({ type: 'chestsLargeAlchemy', tier: 1 })
  ),
  ...Object.values(markers.chests.al2).map(
    toNode({ type: 'chestsLargeAlchemy', tier: 2 })
  ),
  ...Object.values(markers.chests.al3).map(
    toNode({ type: 'chestsLargeAlchemy', tier: 3 })
  ),
  ...Object.values(markers.chests.am1).map(
    toNode({ type: 'chestsMediumAlchemy', tier: 1 })
  ),
  ...Object.values(markers.chests.am2).map(
    toNode({ type: 'chestsMediumAlchemy', tier: 2 })
  ),
  ...Object.values(markers.chests.am3).map(
    toNode({ type: 'chestsMediumAlchemy', tier: 3 })
  ),
  ...Object.values(markers.chests.cl1).map(
    toNode({ type: 'chestsLargeProvisions', tier: 1 })
  ),
  ...Object.values(markers.chests.cl2).map(
    toNode({ type: 'chestsLargeProvisions', tier: 2 })
  ),
  ...Object.values(markers.chests.cl3).map(
    toNode({ type: 'chestsLargeProvisions', tier: 3 })
  ),
  ...Object.values(markers.chests.cm1).map(
    toNode({ type: 'chestsMediumProvisions', tier: 1 })
  ),
  ...Object.values(markers.chests.cm2).map(
    toNode({ type: 'chestsMediumProvisions', tier: 2 })
  ),
  ...Object.values(markers.chests.cm3).map(
    toNode({ type: 'chestsMediumProvisions', tier: 3 })
  ),
  ...Object.values(markers.chests.cs1).map(
    toNode({ type: 'chestsCommonProvisions', tier: 1 })
  ),
  ...Object.values(markers.chests.cs2).map(
    toNode({ type: 'chestsCommonProvisions', tier: 2 })
  ),
  ...Object.values(markers.chests.oe4).map(
    toNode({ type: 'chestsEliteAncient', tier: 4 })
  ),
  ...Object.values(markers.chests.oe5).map(
    toNode({ type: 'chestsEliteAncient', tier: 5 })
  ),
  ...Object.values(markers.chests.ol1).map(
    toNode({ type: 'chestsLargeAncient', tier: 1 })
  ),
  ...Object.values(markers.chests.ol2).map(
    toNode({ type: 'chestsLargeAncient', tier: 2 })
  ),
  ...Object.values(markers.chests.ol3).map(
    toNode({ type: 'chestsLargeAncient', tier: 3 })
  ),
  ...Object.values(markers.chests.om1).map(
    toNode({ type: 'chestsMediumAncient', tier: 1 })
  ),
  ...Object.values(markers.chests.om2).map(
    toNode({ type: 'chestsMediumAncient', tier: 2 })
  ),
  ...Object.values(markers.chests.om3).map(
    toNode({ type: 'chestsMediumAncient', tier: 3 })
  ),
  ...Object.values(markers.chests.os1).map(
    toNode({ type: 'chestsCommonAncient', tier: 1 })
  ),
  ...Object.values(markers.chests.os1).map(
    toNode({ type: 'chestsCommonAncient', tier: 1 })
  ),
  ...Object.values(markers.chests.os2).map(
    toNode({ type: 'chestsCommonAncient', tier: 2 })
  ),
  ...Object.values(markers.chests.os3).map(
    toNode({ type: 'chestsCommonAncient', tier: 3 })
  ),
  ...Object.values(markers.chests.se2).map(
    toNode({ type: 'chestsEliteSupplies', tier: 2 })
  ),
  ...Object.values(markers.chests.se3).map(
    toNode({ type: 'chestsEliteSupplies', tier: 3 })
  ),
  ...Object.values(markers.chests.se4).map(
    toNode({ type: 'chestsEliteSupplies', tier: 4 })
  ),
  ...Object.values(markers.chests.se5).map(
    toNode({ type: 'chestsEliteSupplies', tier: 5 })
  ),
  ...Object.values(markers.chests.sl1).map(
    toNode({ type: 'chestsLargeSupplies', tier: 1 })
  ),
  ...Object.values(markers.chests.sl2).map(
    toNode({ type: 'chestsLargeSupplies', tier: 2 })
  ),
  ...Object.values(markers.chests.sl3).map(
    toNode({ type: 'chestsLargeSupplies', tier: 3 })
  ),
  ...Object.values(markers.chests.sm1).map(
    toNode({ type: 'chestsMediumSupplies', tier: 1 })
  ),
  ...Object.values(markers.chests.sm2).map(
    toNode({ type: 'chestsMediumSupplies', tier: 2 })
  ),
  ...Object.values(markers.chests.sm3).map(
    toNode({ type: 'chestsMediumSupplies', tier: 3 })
  ),
  ...Object.values(markers.chests.ss1).map(
    toNode({ type: 'chestsCommonSupplies', tier: 1 })
  ),
  ...Object.values(markers.chests.ss2).map(
    toNode({ type: 'chestsCommonSupplies', tier: 2 })
  ),
  ...Object.values(markers.chests.ss3).map(
    toNode({ type: 'chestsCommonSupplies', tier: 3 })
  ),
  ...Object.values(markers.documents)
    .flatMap(Object.values)
    .map((document) => ({
      ...toNode({ type: 'lore_note' })(document),
      name: loreTitles[document.title],
    })),
];
const filteredNodes = allNodes.filter(inBrimstoneSands);

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const markersCollection = client.db().collection('markers');

for (const node of filteredNodes) {
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
