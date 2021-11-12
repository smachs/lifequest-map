import type { FilterItem } from '../MapFilter/mapFilters';
import type { Details } from './AddResources';
import styles from './DetailsInput.module.css';
import generalStyles from './AddResources.module.css';

type DetailsInputProps = {
  filter: FilterItem | null;
  details: Details;
  onChange: (details: Details) => void;
};
function DetailsInput({
  details,
  filter,
  onChange,
}: DetailsInputProps): JSX.Element {
  return (
    <form className={styles.form}>
      <div className={styles.inputs}>
        {filter?.hasName && (
          <label className={styles.label}>
            <span className={generalStyles.key}>Name</span>
            <input
              className={styles.input}
              onChange={(event) =>
                onChange({ ...details, name: event.target.value })
              }
              value={details.name || ''}
              placeholder="Enter name"
              required
              autoFocus
            />
          </label>
        )}
        {filter?.hasLevel && (
          <label className={styles.label}>
            <span className={generalStyles.key}>Level</span>
            <input
              className={styles.input}
              type="number"
              min={1}
              onChange={(event) =>
                onChange({ ...details, level: +event.target.value })
              }
              value={details.level || 0}
              required
            />
          </label>
        )}
        <label className={styles.label}>
          <span className={generalStyles.key}>Description (optional)</span>
          <textarea
            className={styles.input}
            onChange={(event) =>
              onChange({ ...details, description: event.target.value })
            }
            value={details.description || ''}
            placeholder="Feel free to add more details about this marker"
            rows={2}
          />
        </label>
      </div>
    </form>
  );
}

export default DetailsInput;
