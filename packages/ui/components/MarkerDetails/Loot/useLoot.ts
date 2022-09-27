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
        const sortedItems = items.sort(
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

export default useLoot;
