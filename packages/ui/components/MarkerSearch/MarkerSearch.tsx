import type { SelectItem } from '@mantine/core';
import { MultiSelect } from '@mantine/core';
import { useState } from 'react';
import { fetchJSON } from '../../utils/api';
import { useMarkerSearchStore } from './markerSearchStore';

const groups: {
  [group: string]: string;
} = {
  'From user': 'from:',
  'Marker name': 'name:',
  'Marker has': 'has:',
  'Marker is': 'is:',
  'Loot contains': 'loot:',
};
const options = Object.values(groups);

const defaultData: SelectItem[] = [
  { value: 'name:', label: 'name: marker', group: 'Search Options' },
  { value: 'loot:', label: 'loot: item', group: 'Search Options' },
  { value: 'is:', label: 'is: hidden', group: 'Search Options' },
  { value: 'has:', label: 'has: comment or issue', group: 'Search Options' },
  { value: 'has: comment', label: 'has: comment', group: 'Marker has' },
  { value: 'has: issue', label: 'has: issue', group: 'Marker has' },
  { value: 'is: hidden', label: 'is: hidden', group: 'Marker is' },
  { value: 'from:', label: 'from: user', group: 'Search Options' },
];

function MarkerSearch() {
  const { searchValues, onChange, refreshMarkerIds } = useMarkerSearchStore();
  const [searchValue, onSearchChange] = useState('');
  const [data, setData] = useState<SelectItem[]>(defaultData);
  const [loaded, setLoaded] = useState(false);

  const handleFocus = () => {
    if (loaded) {
      return;
    }
    setLoaded(true);
    fetchJSON<{
      from: string[];
      name: string[];
      loot: string[];
    }>('/api/search')
      .then((result) => {
        setData((current) => [
          ...current,
          ...result.from.map((item) => ({
            value: `from: ${item}`,
            label: `from: ${item}`,
            group: 'From user',
          })),
          ...result.name.map((item) => ({
            value: `name: ${item}`,
            label: `name: ${item}`,
            group: 'Marker name',
          })),
          ...result.loot.map((item) => ({
            value: `loot: ${item}`,
            label: `loot: ${item}`,
            group: 'Loot contains',
          })),
        ]);
      })
      .catch(console.error);
  };

  return (
    <MultiSelect
      placeholder="Search"
      maxDropdownHeight={260}
      searchable
      searchValue={searchValue}
      limit={10}
      onSearchChange={onSearchChange}
      onFocus={handleFocus}
      data={data}
      value={searchValues}
      onChange={(searchValues) => {
        if (options.some((option) => searchValues.includes(option))) {
          onSearchChange(`${searchValues.at(-1)!} `);
        } else {
          onChange(searchValues);
          refreshMarkerIds();
        }
      }}
      filter={(value, _selected, item) => {
        const lowerCaseValue = value.toLowerCase();
        if (item.group === 'Search Options') {
          return (
            item.value.startsWith(lowerCaseValue) &&
            item.value !== lowerCaseValue
          );
        }
        const option = groups[item.group!];
        return (
          lowerCaseValue.startsWith(option) &&
          item.label!.toLowerCase().includes(lowerCaseValue.trim())
        );
      }}
    />
  );
}

export default MarkerSearch;
