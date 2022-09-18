import { useEffect, useState } from 'react';

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

const ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function useNewWorldFansLoot(name: string) {
  const [items, setItems] = useState<CreatureLootResult['items'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `https://newworldfans.com/api/v2/db/creature/name/${encodeURIComponent(
        name
      )}/loot`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((result: CreatureLootResult) => {
        const sortedItems = result.items.sort(
          (a, b) => ORDER.indexOf(b.rarity) - ORDER.indexOf(a.rarity)
        );
        setItems(sortedItems);
      })
      .finally(() => setIsLoading(false));
  }, [name]);

  return {
    items,
    isLoading,
  };
}

export default useNewWorldFansLoot;
