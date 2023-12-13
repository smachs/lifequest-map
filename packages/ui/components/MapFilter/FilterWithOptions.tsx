import type { FilterItem } from 'static';
import { classNames } from '../../utils/styles';
import Checkbox from './Checkbox';
import styles from './FilterWithOptions.module.css';
const { VITE_API_ENDPOINT = '' } = import.meta.env;

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
        imgSrc={`${VITE_API_ENDPOINT}/assets${filter.iconUrl}?v=4`}
        title={filter.title}
      />
      <div className={styles.container}>
        {options.map((option) => {
          const checked = filters.includes(`${filter.type}-${option}`);
          return (
            <label
              key={option}
              className={classNames(styles.label, checked && styles.active)}
            >
              {option}
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  onToggle([`${filter.type}-${option}`], event.target.checked)
                }
              />
            </label>
          );
        })}
      </div>
    </>
  );
};

export default FilterWithOptions;
