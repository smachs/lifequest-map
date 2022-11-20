import type { FilterItem } from 'static';
import type { Details } from './AddResources';
import styles from './DetailsInput.module.css';
import generalStyles from './AddResources.module.css';
import TierInput from './TierInput';
import SizeInput from './SizeInput';
import SelectGlyphType from './Details/Select/SelectGlyphType';

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
        {filter?.category === 'chests' && filter?.type.includes('Supplies') && (
          <label className={styles.label}>
            <span className={generalStyles.key}>Chest Type</span>
            <select
              value={details.chestType || ''}
              onChange={(event) =>
                onChange({ ...details, chestType: event.target.value })
              }
            >
              <option value="Supply">Supply</option>
              <option value="Blacksmith">Blacksmith</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Engineering">Engineering</option>
              <option value="Farmland">Farmland</option>
              <option value="Outfitting">Outfitting</option>
              <option value="Smelting">Smelting</option>
              <option value="Tanning">Tanning</option>
              <option value="Weaving">Weaving</option>
            </select>
          </label>
        )}
        {filter?.category === 'chests' && (
          <label className={styles.label}>
            <span className={generalStyles.key}>Tier</span>
            <TierInput
              onChange={(tier) => onChange({ ...details, tier })}
              value={details.tier || 0}
              max={filter.maxTier || 5}
            />
          </label>
        )}
        {filter?.sizes && (
          <label className={styles.label}>
            <span className={generalStyles.key}>Size</span>
            <SizeInput
              onChange={(size) => onChange({ ...details, size })}
              value={details.size || '?'}
              sizes={filter.sizes}
            />
          </label>
        )}
        {filter?.hasCustomRespawnTimer && (
          <label className={styles.label}>
            <span className={generalStyles.key}>Respawn (optional)</span>
            <div>
              <input
                type="number"
                name="size"
                min={0}
                value={details.customRespawnTimer}
                style={{ width: 130 }}
                onChange={(event) =>
                  onChange({
                    ...details,
                    customRespawnTimer: +event.target.value,
                  })
                }
              />
              <span>seconds</span>
            </div>
          </label>
        )}
        {filter?.hasHP && (
          <label className={styles.label}>
            <span className={generalStyles.key}>HP (optional)</span>
            <input
              type="number"
              name="size"
              value={details.hp}
              min={0}
              onChange={(event) =>
                onChange({
                  ...details,
                  hp: +event.target.value,
                })
              }
            />
          </label>
        )}
        {filter?.glyph && (
          <SelectGlyphType
            details={details}
            onChange={onChange}
            isRequired={filter.glyph?.isRequired}
          />
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
