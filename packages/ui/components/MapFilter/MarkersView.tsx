import styles from './MarkersView.module.css';
import { mapFiltersCategories } from 'static';
import MarkerSection from './MarkerSection';
import { useFilters } from '../../contexts/FiltersContext';
import { usePersistentState } from '../../utils/storage';
import SearchInput from '../SearchInput/SearchInput';
import PresetSelect from '../PresetSelect/PresetSelect';
import { useState } from 'react';
import type { Preset } from '../PresetSelect/presets';
import MarkerSearch from '../MarkerSearch/MarkerSearch';
import { useUserStore } from '../../utils/userStore';
import { Button, ScrollArea } from '@mantine/core';

type MarkersViewProps = {
  onAdd: () => void;
};
function MarkersView({ onAdd }: MarkersViewProps): JSX.Element {
  const { filters, setFilters } = useFilters();
  const [search, setSearch] = usePersistentState('searchMarkerTypes', '');
  const [preset, setPreset] = useState<Preset | null>(null);
  const account = useUserStore((state) => state.account);

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
    setPreset(null);
  }
  return (
    <section className={styles.container}>
      <div className={styles.actions}>
        <Button disabled={!account} onClick={onAdd}>
          {account ? 'Add node' : 'Login to add nodes'}
        </Button>
      </div>
      <MarkerSearch />
      <div className={styles.actions}>
        <SearchInput
          placeholder="Filter marker types..."
          value={search}
          onChange={setSearch}
        />
        <PresetSelect
          value={preset}
          onChange={(preset) => {
            setPreset(preset);
            if (preset) {
              setFilters(preset.types);
            }
          }}
        />
      </div>
      <ScrollArea style={{ height: 'calc(100vh - 210px)' }} offsetScrollbars>
        {mapFiltersCategories.map((mapFilterCategory) => (
          <MarkerSection
            key={mapFilterCategory.value}
            mapFilterCategory={mapFilterCategory}
            filters={filters}
            onToggle={handleToggle}
            search={search}
          />
        ))}
      </ScrollArea>
    </section>
  );
}

export default MarkersView;
