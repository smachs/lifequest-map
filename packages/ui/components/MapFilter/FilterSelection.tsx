import type { FilterItem } from 'static';
import Checkbox from './Checkbox';
import FilterWithOptions from './FilterWithOptions';

type FilterSectionProps = {
  filters: string[];
  filter: FilterItem;
  onToggle: (filterTypes: string[], checked: boolean) => void;
};

const FilterSelection = ({ filter, filters, onToggle }: FilterSectionProps) => {
  if (filter.category === 'chests') {
    if (location.search.includes('test=1')) {
      return <></>;
    }
    const options = Array(filter.maxTier || 5)
      .fill(null)
      .map((_, index) => index + 1)
      .map(String);
    return (
      <FilterWithOptions
        options={options}
        filters={filters}
        filter={filter}
        onToggle={onToggle}
      />
    );
  }
  if (filter.sizes) {
    if (location.search.includes('test=2')) {
      return <></>;
    }
    return (
      <FilterWithOptions
        options={filter.sizes}
        filters={filters}
        filter={filter}
        onToggle={onToggle}
      />
    );
  }

  if (location.search.includes('test=3')) {
    return <></>;
  }

  return (
    <Checkbox
      onChange={(checked) => onToggle([filter.type], checked)}
      checked={filters.includes(filter.type)}
      imgSrc={filter.iconUrl}
      title={filter.title}
    />
  );
};

export default FilterSelection;
