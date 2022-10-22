import useLoot from './useLoot';
import {
  Anchor,
  Badge,
  Group,
  Image,
  List,
  Skeleton,
  Text,
} from '@mantine/core';
import { useEffect } from 'react';

const rarityColors: {
  [rarity: string]: string;
} = {
  common: '#c3c3c3',
  uncommon: '#34bf48',
  rare: '#28bfd0',
  epic: '#e72fe5',
  legendary: '#c76b2a',
};
type LootProps = {
  markerId: string;
};
function Loot({ markerId }: LootProps) {
  const { isLoading, items } = useLoot(markerId);

  useEffect(() => {
    if (document.querySelector('#newworldfans-tooltips')) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'newworldfans-tooltips';
    script.src = 'https://cdn.newworldfans.com/tooltips/nw-tooltips.min.js';
    script.async = true;
    script.onload = () => {
      window.document.dispatchEvent(
        new Event('DOMContentLoaded', {
          bubbles: true,
          cancelable: true,
        })
      );
    };
    document.body.appendChild(script);
  }, []);

  return (
    <List
      spacing="xs"
      styles={{
        itemWrapper: {
          width: '100%',
        },
      }}
    >
      {isLoading && <Skeleton height={40} />}
      {!isLoading && !items && <Text color="dimmed">No loot found</Text>}
      {!isLoading &&
        items?.map((item) => (
          <List.Item
            key={item.id}
            icon={<Image src={item.iconSrc} width={24} height={24} />}
            sx={{
              width: '100%',
            }}
          >
            <Anchor
              href={`https://newworldfans.com/db/item/${item.slug}`}
              target="_blank"
              sx={{
                color: rarityColors[item.rarity],
                width: '100%',
                ':hover': {
                  textDecoration: 'none',
                },
              }}
            >
              <Group>
                <Text>{item.name}</Text>
                {(item.gearScore > 0 || item.maxGearScore > 0) && (
                  <Badge
                    color="lime"
                    sx={{
                      cursor: 'inherit',
                    }}
                  >
                    {item.gearScore > 0
                      ? item.gearScore
                      : item.minGearScore !== item.maxGearScore
                      ? `${item.minGearScore}-${item.maxGearScore}`
                      : item.maxGearScore}{' '}
                    GS
                  </Badge>
                )}

                {item.unique && (
                  <Badge
                    sx={{
                      cursor: 'inherit',
                    }}
                  >
                    Unique
                  </Badge>
                )}
              </Group>
            </Anchor>
          </List.Item>
        ))}
    </List>
  );
}

export default Loot;
