import type { FilterItem } from 'static';
import Checkbox from './Checkbox';
import FilterWithOptions from './FilterWithOptions';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

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
  if (filter.sizes) {
    return (
      <FilterWithOptions
        options={filter.sizes}
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
      imgSrc={`${VITE_API_ENDPOINT}/assets${filter.iconUrl}?v=2`}
      title={filter.title}
    />
  );
};

export default FilterSelection;
