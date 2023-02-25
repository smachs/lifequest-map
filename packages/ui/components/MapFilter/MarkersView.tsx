import {
  ActionIcon,
  Button,
  ScrollArea,
  Stack,
  TextInput,
} from '@mantine/core';
import { IconFilter, IconX } from '@tabler/icons';
import { mapFiltersCategories } from 'static';
import { useFiltersStore } from '../../utils/filtersStore';
import { escapeRegExp } from '../../utils/regExp';
import { usePersistentState } from '../../utils/storage';
import { useUserStore } from '../../utils/userStore';
import MarkerSearch from '../MarkerSearch/MarkerSearch';
import PresetSelect from '../PresetSelect/PresetSelect';
import { useUpsertStore } from '../UpsertArea/upsertStore';
import MarkerSection from './MarkerSection';

function MarkersView(): JSX.Element {
  const { filters, setFilters } = useFiltersStore();
  const [search, setSearch] = usePersistentState('searchMarkerTypes', '');
  const account = useUserStore((state) => state.account);
  const upsertStore = useUpsertStore();
  function handleToggle(filterTypes: string[], checked: boolean) {
    const newFilters = [...filters];
    if (checked) {
      newFilters.push(...filterTypes);
    } else {
      filterTypes.forEach((filterType) => {
        const index = newFilters.indexOf(filterType);
        if (index !== -1) {
          newFilters.splice(newFilters.indexOf(filterType), 1);
        }
      });
    }
    const uniqueFilters = Array.from(new Set(newFilters));
    setFilters(uniqueFilters);
  }
  const searchRegExp = search ? new RegExp(escapeRegExp(search), 'i') : null;

  if (location.search.includes('test=1')) {
    return <></>;
  }
  return (
    <Stack>
      <Button disabled={!account} onClick={() => upsertStore.setMarker(true)}>
        {account ? 'Add node' : 'Login to add nodes'}
      </Button>
      <MarkerSearch />
      <TextInput
        placeholder="Filter node types..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        icon={<IconFilter />}
        rightSection={
          <ActionIcon onClick={() => setSearch('')} aria-label="Clear filter">
            <IconX />
          </ActionIcon>
        }
      />
      {!location.search.includes('test=2') && (
        <PresetSelect onChange={setFilters} filters={filters} />
      )}
      {!location.search.includes('test=3') && (
        <ScrollArea style={{ height: 'calc(100vh - 270px)' }} offsetScrollbars>
          {mapFiltersCategories.map((mapFilterCategory) => (
            <MarkerSection
              key={mapFilterCategory.value}
              mapFilterCategory={mapFilterCategory}
              filters={filters}
              onToggle={handleToggle}
              searchRegExp={searchRegExp}
            />
          ))}
        </ScrollArea>
      )}
    </Stack>
  );
}

export default MarkersView;
