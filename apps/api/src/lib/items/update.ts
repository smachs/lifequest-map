import { getMarkersCollection } from '../markers/collection.js';
import fetch from 'isomorphic-fetch';
import { getItemsCollection } from './collection.js';

type CreatureLootResult = {
  count: number;
  per_page: number;
  items: {
    asset_path: string;
    description: string;
    gear_score_override: number;
    icon_path: string | null;
    item_class: string;
    item_id: string;
    item_type: string;
    item_type_display_name: string;
    loot: {
      item: string;
      loot_tags: string;
      quantity: number;
      match_one: boolean;
    };
    max_gear_score: number;
    min_gear_score: number;
    name: string;
    perks: [
      null | {
        index: number;
        perk_id: string;
        name: string;
        description: string;
        icon_path: string;
        perk_type: string;
      }
    ][];
    rarity: string;
    slug: string;
    tier: number;
    unique: null | string;
  }[];
};

export const updateItems = async () => {
  await getItemsCollection().deleteMany({});

  const creatures = await getMarkersCollection()
    .find(
      {
        type: {
          $in: ['boss', 'bossElite', 'rafflebones_25', 'rafflebones_66'],
        },
      },
      {
        projection: {
          _id: 1,
          name: 1,
        },
      }
    )
    .toArray();
  const items: CreatureLootResult['items'] = [];
  const markerIds: {
    [itemId: string]: string[];
  } = {};
  for (const creature of creatures) {
    let url = '';
    switch (creature.type) {
      case 'rafflebones_25':
        url =
          'https://newworldfans.com/api/v2/db/creature/vitals_id/Loot_Goblin/loot';
        break;
      case 'rafflebones_66':
        url =
          'https://newworldfans.com/api/v2/db/creature/vitals_id/Loot_Goblin_60/loot';
        break;
      default:
        `https://newworldfans.com/api/v2/db/creature/name/${encodeURIComponent(
          creature.name!
        )}/loot`;
        break;
    }
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`Skip ${creature.name}`);
      continue;
    }
    const result = (await response.json()) as CreatureLootResult;
    for (const item of result.items) {
      if (!items.some((i) => i.item_id === item.item_id)) {
        items.push(item);
      }
      if (!markerIds[item.item_id]) {
        markerIds[item.item_id] = [];
      }
      markerIds[item.item_id].push(creature._id.toString());
    }
  }

  const now = new Date();
  for (const item of items) {
    await getItemsCollection().updateOne(
      { id: item.item_id },
      {
        $setOnInsert: {
          createdAt: now,
        },
        $set: {
          updatedAt: now,
          name: item.name,
          rarity: item.rarity,
          iconSrc: item.asset_path.replace(
            'items_hires',
            item.item_type.toLowerCase()
          ),
          minGearScore: item.min_gear_score,
          maxGearScore: item.max_gear_score,
          markerIds: markerIds[item.item_id],
        },
      },
      { upsert: true }
    );
  }
};
