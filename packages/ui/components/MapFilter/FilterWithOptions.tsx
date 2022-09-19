import Checkbox from './Checkbox';
import type { FilterItem } from 'static';
import styles from './FilterWithOptions.module.css';
import { classNames } from '../../utils/styles';

type FilterWithOptionsProps = {
  options: string[];
  filter: FilterItem;
  filters: string[];
  onToggle: (filterTypes: string[], checked: boolean) => void;
};

const FilterWithOptions = ({
  options,
  filter,
  filters,
  onToggle,
}: FilterWithOptionsProps) => {
  return (
    <>
      <Checkbox
        onChange={(checked) =>
          onToggle(
            options.map((option) => `${filter.type}-${option}`),
            checked
          )
        }
        checked={filters.some((activeFilter) =>
          options.some((option) => `${filter.type}-${option}` === activeFilter)
        )}
        imgSrc={filter.iconUrl}
        title={filter.title}
        countType={filter.type}
      />
      <div className={styles.container}>
        {options.map((option) => (
          <label
            key={option}
            className={classNames(
              styles.label,
              filters.includes(`${filter.type}-${option}`) && styles.active
            )}
          >
            {option}
            <input
              type="checkbox"
              checked={filters.includes(`${filter.type}-${option}`)}
              onChange={(event) =>
                onToggle([`${filter.type}-${option}`], event.target.checked)
              }
            />
          </label>
        ))}
      </div>
    </>
  );
};

export default FilterWithOptions;
