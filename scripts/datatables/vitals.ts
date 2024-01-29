import dotenv from 'dotenv';
import { Double, MongoClient, ObjectId } from 'mongodb';
import type { MarkerDTO } from 'static';
import { findMapDetails, mapFilters, mapIsAeternumMap } from 'static';
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const markersCollection = client.db().collection<MarkerDTO>('markers');
const commentsCollection = client.db().collection('comments');

const amMarkers = await markersCollection.find({}).toArray();

function vitalsIDToType(vitalsID: string) {
  if (vitalsID.includes('_dt')) {
    return null;
  }
  if (vitalsID.startsWith('alligator')) {
    return 'alligator';
  }
  if (vitalsID.startsWith('armadillo')) {
    return 'armadillo';
  }
  if (vitalsID.startsWith('bear')) {
    return 'bear';
  }
  if (vitalsID.startsWith('bison')) {
    return 'bison';
  }
  if (vitalsID.startsWith('boar')) {
    return 'boar';
  }
  if (vitalsID.startsWith('cow')) {
    return 'cow';
  }
  if (vitalsID.startsWith('elk')) {
    return 'elk';
  }
  if (vitalsID.startsWith('goat')) {
    return 'goat';
  }
  if (vitalsID.includes('_chameleon')) {
    return 'chameleon';
  }
  if (vitalsID.includes('_dragon')) {
    return 'drake';
  }
  if (vitalsID.startsWith('legion_signifer_loc_boss')) {
    return 'signiferNerva';
  }
  return null;
}

const vitalsData = (await fetch(
  'https://raw.githubusercontent.com/giniedp/nw-buddy-data/main/live/datatables/generated_vitals_metadata.json'
).then((response) => response.json())) as VitalsMetadata;
const vitalsCategories = (await fetch(
  'https://raw.githubusercontent.com/giniedp/nw-buddy-data/main/live/datatables/javelindata_vitalscategories.json'
).then((response) => response.json())) as VitalsCategories;
const enLocalizationData = (await fetch(
  'https://raw.githubusercontent.com/giniedp/nw-buddy-data/main/live/localization/en-us.json'
).then((response) => response.json())) as Record<string, string>;

const vitalsIDs = vitalsData.flatMap((vitals) => vitals.vitalsID);
const remainingVitalsIDs = vitalsIDs.slice(0);
const dict: Record<string, string> = {};
const updatedMarkers: Record<string, MarkerDTO> = {};
const deprecatedMarkers: Record<string, typeof amMarkers> = {};
const now = new Date();
const markers = vitalsData.flatMap((vitals) => {
  const type = vitalsIDToType(vitals.vitalsID);
  if (!type) {
    return [];
  }
  remainingVitalsIDs.splice(remainingVitalsIDs.indexOf(vitals.vitalsID), 1);
  const mapFilter = mapFilters.find((mapFilter) => mapFilter.type === type);
  if (!mapFilter) {
    throw new Error(`Cannot find map filter for type ${type}`);
  }
  if (!mapFilter.hasLevel) {
    throw new Error(`Map filter ${type} has no level`);
  }

  if (!(type in deprecatedMarkers)) {
    deprecatedMarkers[mapFilter.type] = amMarkers.filter((amMarker) => {
      return amMarker.type === mapFilter.type;
    });
    console.log(
      `Found ${deprecatedMarkers[mapFilter.type].length} markers for ${type}`
    );
  }

  const getExistingMarkerIndex = (marker: MarkerDTO) => {
    return deprecatedMarkers[mapFilter.type].findIndex((amMarker) => {
      return (
        Number(amMarker.position[0]) === Number(marker.position[0]) &&
        Number(amMarker.position[1]) === Number(marker.position[1])
      );
    });
  };

  const newMarkers = vitals.mapIDs.flatMap((mapID) => {
    return vitals.lvlSpanws[mapID]!.flatMap((lvlSpanw) => {
      const marker: MarkerDTO = {
        vitalsID: vitals.vitalsID,
        catIDs: lvlSpanw.c,
        type: type,
        position: [new Double(lvlSpanw.p[0]), new Double(lvlSpanw.p[1])],
        username: 'system',
        levels: lvlSpanw.l,
        createdAt: now,
      };
      const map = findMapDetails(mapID);
      if (!map) {
        throw new Error(`Cannot find map ${mapID}`);
      }
      if (!mapIsAeternumMap(map.name)) {
        marker.map = map.name;
      }
      lvlSpanw.c.forEach((catID) => {
        if (!(catID in dict)) {
          const vitalsCategory = vitalsCategories.find(
            (vitalsCategory) =>
              vitalsCategory.VitalsCategoryID.toLowerCase() === catID
          );
          if (!vitalsCategory) {
            console.warn(`Cannot find vitals category ${catID}`);
            if (!enLocalizationData[`${vitals.vitalsID}_vitalsname`]) {
              throw new Error(`Vitals ${vitals.vitalsID} has no vitals name`);
            }
            dict[catID] = enLocalizationData[`${vitals.vitalsID}_vitalsname`];
            return;
          }
          if (!vitalsCategory.DisplayName) {
            throw new Error(`Vitals category ${catID} has no display name`);
          }
          if (!enLocalizationData[vitalsCategory.DisplayName.toLowerCase()]) {
            throw new Error(
              `Vitals category ${catID} display name ${vitalsCategory.DisplayName} has no localization`
            );
          }
          dict[catID] =
            enLocalizationData[vitalsCategory.DisplayName.toLowerCase()];
        }
      });

      const existingIndex = getExistingMarkerIndex(marker);
      if (existingIndex !== -1) {
        const existingMarker = deprecatedMarkers[mapFilter.type][existingIndex];
        if (
          existingMarker.catIDs !== marker.catIDs ||
          existingMarker.levels !== marker.levels
        ) {
          updatedMarkers[existingMarker._id.toString()] = marker;
        }
        deprecatedMarkers[mapFilter.type].splice(existingIndex, 1);

        return [];
      }
      return marker;
    });
  });
  return newMarkers;
});
const markersByType = markers.reduce((acc, marker) => {
  acc[marker.type] = (acc[marker.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log(`${markers.length} new markers`, markersByType);

const deprecatedMarkersByType = Object.entries(deprecatedMarkers).reduce(
  (acc, [type, markers]) => {
    acc[type] = markers.length;
    return acc;
  },
  {} as Record<string, number>
);
const totalDeprecatedMarkers = Object.values(deprecatedMarkersByType).reduce(
  (acc, count) => acc + count,
  0
);

console.log(
  `${totalDeprecatedMarkers} deprecated markers`,
  deprecatedMarkersByType
);

const totalUpdatedMarkers = Object.values(updatedMarkers).length;
console.log(`${totalUpdatedMarkers} updated markers`, totalUpdatedMarkers);

for (const [id, marker] of Object.entries(updatedMarkers)) {
  await markersCollection.updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        catIDs: marker.catIDs,
        levels: marker.levels,
        updatedAt: now,
      },
    }
  );
}

await writeVitalsIDs();

for (const [type, markers] of Object.entries(deprecatedMarkers)) {
  const removableMarkerIDs = markers.map((marker) => new ObjectId(marker._id));
  if (removableMarkerIDs.length === 0) {
    continue;
  }
  const markersDeleteResult = await markersCollection.deleteMany({
    _id: {
      $in: removableMarkerIDs,
    },
  });
  const commentsDeleteResult = await commentsCollection.deleteMany({
    markerId: {
      $in: removableMarkerIDs,
    },
  });
  console.log(`Removed ${markersDeleteResult.deletedCount} markers of ${type}`);
  console.log(
    `Removed ${commentsDeleteResult.deletedCount} commends of ${type}`
  );
}

const insertedByType = {} as Record<string, number>;
for (const marker of markers) {
  const result = await markersCollection.updateOne(
    {
      type: marker.type,
      position: marker.position,
    },
    {
      $setOnInsert: {
        ...marker,
      },
    },
    {
      upsert: true,
    }
  );
  if (result.upsertedCount === 1) {
    insertedByType[marker.type] = (insertedByType[marker.type] || 0) + 1;
  }
}
console.log(insertedByType);
await client.close();

async function writeVitalsIDs() {
  await Bun.write(
    import.meta.dir + '/vitalIDs.json',
    JSON.stringify(vitalsIDs)
  );
  await Bun.write(
    import.meta.dir + '/remainingVitalsIDs.json',
    JSON.stringify(remainingVitalsIDs)
  );
}

type Spawn = {
  p: Array<number>;
  l: Array<number>;
  c: Array<string>;
};

type VitalsMetadata = Array<{
  vitalsID: string;
  tables: Array<string>;
  mapIDs: Array<keyof VitalsMetadata[number]['lvlSpanws']>;
  models: Array<string>;
  catIDs: Array<string>;
  levels: Array<number>;
  lvlSpanws: {
    newworld_vitaeeterna?: Array<Spawn>;
    nw_dungeon_cutlasskeys_00?: Array<Spawn>;
    nw_dungeon_greatcleave_00?: Array<Spawn>;
    nw_trial_season_04?: Array<Spawn>;
    nw_dungeon_everfall_00?: Array<Spawn>;
    nw_dungeon_reekwater_00?: Array<Spawn>;
    nw_dungeon_brimstonesands_00?: Array<Spawn>;
    nw_ori_gc_questnihilo?: Array<Spawn>;
    nw_dungeon_restlessshores_01?: Array<Spawn>;
    nw_dungeon_edengrove_00?: Array<Spawn>;
    nw_dungeon_shattermtn_00?: Array<Spawn>;
    climaxftue_02?: Array<Spawn>;
    nw_trial_season_02?: Array<Spawn>;
    nw_ori_eg_questmotherwell?: Array<Spawn>;
    nw_dungeon_greatcleave_01?: Array<Spawn>;
    nw_dungeon_firstlight_01?: Array<Spawn>;
    nw_ori_fl_questadiana?: Array<Spawn>;
    nw_dungeon_windsward_00?: Array<Spawn>;
    nw_trial_season_04_daichidojo?: Array<Spawn>;
    nw_trial_season_04_deviceroom?: Array<Spawn>;
  };
}>;

export type VitalsCategories = Array<{
  VitalsCategoryID: string;
  DisplayName?: string;
  GroupVitalsCategoryId?: string;
  IsNamed: boolean;
  IsDynamicPoiTarget: boolean;
  LootDropChanceOverride: number;
  MtlOverride?: string;
  Icon?: string;
  FemaleMtlOverride?: string;
  LocationHint?: string;
}>;
