import Checkbox from './Checkbox';
import type { FilterItem } from './mapFilters';
import styles from './ChestFilter.module.css';
import { classNames } from '../../utils/styles';

type ChestFilterProps = {
  filter: FilterItem;
  filters: string[];
  onToggle: (filterTypes: string[], checked: boolean) => void;
};
const ChestFilter = ({ filter, filters, onToggle }: ChestFilterProps) => {
  const tiers = Array(filter.maxTier || 5)
    .fill(null)
    .map((_, index) => index + 1);

  return (
    <>
      <Checkbox
        onChange={(checked) =>
          onToggle(
            tiers.map((tier) => `${filter.type}-${tier}`),
            checked
          )
        }
        checked={filters.some((activeFilter) =>
          tiers.some((tier) => `${filter.type}-${tier}` === activeFilter)
        )}
        imgSrc={filter.iconUrl}
        title={filter.title}
        countType={filter.type}
      />
      <div className={styles.container}>
        {tiers.map((tier) => (
          <label
            key={tier}
            className={classNames(
              styles.label,
              filters.includes(`${filter.type}-${tier}`) && styles.active
            )}
          >
            {tier}
            <input
              type="checkbox"
              checked={filters.includes(`${filter.type}-${tier}`)}
              onChange={(event) =>
                onToggle([`${filter.type}-${tier}`], event.target.checked)
              }
            />
          </label>
        ))}
      </div>
    </>
  );
};

export default ChestFilter;
