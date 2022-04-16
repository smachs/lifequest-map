import Checkbox from './Checkbox';
import type { FilterItem } from './mapFilters';
import FilterWithOptions from './FilterWithOptions';
import { sizes } from '../AddResources/SizeInput';

type FilterSectionProps = {
  filters: string[];
  filter: FilterItem;
  onToggle: (filterTypes: string[], checked: boolean) => void;
};

const FilterSelection = ({ filter, filters, onToggle }: FilterSectionProps) => {
  if (filter.category === 'chests') {
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
  if (filter.hasSize) {
    return (
      <FilterWithOptions
        options={sizes}
        filters={filters}
        filter={filter}
        onToggle={onToggle}
      />
    );
  }

  return (
    <Checkbox
      onChange={(checked) => onToggle([filter.type], checked)}
      checked={filters.includes(filter.type)}
      imgSrc={filter.iconUrl}
      title={filter.title}
      countType={filter.type}
    />
  );
};

export default FilterSelection;
