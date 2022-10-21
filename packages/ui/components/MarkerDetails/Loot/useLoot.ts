import { useEffect, useState } from 'react';
import type { ItemDTO } from 'static';
import { fetchJSON } from '../../../utils/api';

const ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function useLoot(markerId: string) {
  const [items, setItems] = useState<ItemDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchJSON<ItemDTO[]>(`/api/items/markers/${markerId}`)
      .then((items) => {
        const sortedItems = items.sort((a, b) => {
          if (b.unique && !a.unique) {
            return 1;
          }
          if (!b.unique && a.unique) {
            return -1;
          }
          if (a.rarity !== b.rarity) {
            return ORDER.indexOf(b.rarity) - ORDER.indexOf(a.rarity);
          }
          return a.name.localeCompare(b.name);
        });
        setItems(sortedItems);
      })
      .finally(() => setIsLoading(false));
  }, [name]);

  return {
    items,
    isLoading,
  };
}

export default useLoot;
