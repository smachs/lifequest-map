import { Avatar, FocusTrap, Group, Select, Text } from '@mantine/core';
import { forwardRef } from 'react';
import type { FilterItem } from 'static';
import { mapFilters } from 'static';
import { usePersistentState } from '../../utils/storage';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} size="sm" />
        <Text size="xs">{label}</Text>
      </Group>
    </div>
  )
);

type SelectTypeType = {
  onSelect: (filter: FilterItem | null) => void;
  filter: FilterItem | null;
};
function SelectType({ onSelect, filter }: SelectTypeType): JSX.Element {
  const [lastSearch, setLastSearch] = usePersistentState<string[]>(
    'last-type-search',
    []
  );

  return (
    <FocusTrap active>
      <Select
        label="Type"
        placeholder="Search marker type..."
        autoFocus
        itemComponent={SelectItem}
        searchable
        value={filter?.type}
        onChange={(value) => {
          const filter = mapFilters.find((filter) => filter.type === value)!;
          onSelect(filter);
          setLastSearch((lastSearch) =>
            [
              filter.type,
              ...lastSearch.filter((last) => last !== filter.type),
            ].slice(0, 3)
          );
        }}
        data={[
          ...(lastSearch
            .map((type) => {
              const filter = mapFilters.find((filter) => filter.type === type)!;
              if (!filter) {
                return null;
              }
              return {
                value: filter.type,
                image: filter.iconUrl,
                label: filter.title,
              };
            })
            .filter((type) => type !== null) as {
            value: string;
            image: string;
            label: string;
          }[]),
          ...mapFilters
            .filter(
              (filter) => !lastSearch.some((type) => filter.type === type)
            )
            .map((filter) => ({
              value: filter.type,
              image: filter.iconUrl,
              label: filter.title,
            })),
        ]}
      />
    </FocusTrap>
  );
}

export default SelectType;
