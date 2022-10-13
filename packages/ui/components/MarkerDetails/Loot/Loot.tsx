import useLoot from './useLoot';
import { Image, List, Skeleton, Text } from '@mantine/core';

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
          </List.Item>
        ))}
    </List>
  );
}

export default Loot;
