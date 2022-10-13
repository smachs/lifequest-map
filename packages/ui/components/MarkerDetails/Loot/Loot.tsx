import useLoot from './useLoot';
import { Anchor, Group, Image, List, Skeleton, Text } from '@mantine/core';
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
    script.src = 'http://localhost:8126/src/main.js';
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
    <List spacing="xs">
      {isLoading && <Skeleton height={40} />}
      {!isLoading && !items && <Text color="dimmed">No loot found</Text>}
      {!isLoading &&
        items?.map((item) => (
          <List.Item
            key={item.id}
            icon={<Image src={item.iconSrc} width={24} height={24} />}
            style={{
              color: rarityColors[item.rarity],
            }}
          >
            <Anchor
              href={`https://newworldfans.com/db/item/${item.slug}`}
              target="_blank"
            >
              <Group>
                {item.name}
                {item.maxGearScore > 0 && (
                  <>
                    {item.minGearScore !== item.maxGearScore ? (
                      <Text component="span">
                        {item.minGearScore}-{item.maxGearScore} GS
                      </Text>
                    ) : (
                      <Text component="span">{item.maxGearScore} GS</Text>
                    )}
                  </>
                )}
              </Group>
            </Anchor>
          </List.Item>
        ))}
    </List>
  );
}

export default Loot;
