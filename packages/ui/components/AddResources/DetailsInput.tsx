import {
  Checkbox,
  NumberInput,
  SegmentedControl,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import type { FilterItem } from 'static';
import type { Details } from './AddResources';
import SelectGlyphType from './SelectGlyphType';
import SizeInput from './SizeInput';
import TierInput from './TierInput';

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
    <>
      {filter?.hasName && (
        <TextInput
          label="Name"
          onChange={(event) =>
            onChange({ ...details, name: event.target.value })
          }
          value={details.name || ''}
          placeholder="Enter name"
          required
          autoFocus
        />
      )}
      {filter?.hasLevel && (
        <NumberInput
          label="Level"
          type="number"
          min={1}
          onChange={(value) =>
            onChange({ ...details, level: value || undefined })
          }
          value={details.level || 0}
          required
        />
      )}
      {filter?.category === 'chests' && filter?.type.includes('Supplies') && (
        <label>
          <Text size="xs">Chest Type</Text>
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
        <label>
          <Text size="xs">Tier</Text>
          <TierInput
            onChange={(tier) => onChange({ ...details, tier })}
            value={details.tier || 0}
            max={filter.maxTier || 5}
          />
        </label>
      )}
      {filter?.sizes && (
        <label>
          <Text size="xs">Size</Text>
          <SizeInput
            onChange={(size) => onChange({ ...details, size })}
            value={details.size || '?'}
            sizes={filter.sizes}
          />
        </label>
      )}
      {filter?.hasCustomRespawnTimer && (
        <NumberInput
          label="Respawn in seconds"
          type="number"
          name="size"
          min={0}
          value={details.customRespawnTimer}
          onChange={(value) =>
            onChange({
              ...details,
              customRespawnTimer: value || undefined,
            })
          }
        />
      )}
      {filter?.hasHP && (
        <NumberInput
          label="HP"
          type="number"
          name="size"
          value={details.hp}
          min={0}
          onChange={(value) =>
            onChange({
              ...details,
              hp: value || undefined,
            })
          }
        />
      )}
      {filter?.glyph && (
        <SelectGlyphType
          details={details}
          onChange={onChange}
          isRequired={filter.glyph?.isRequired}
        />
      )}
      <Checkbox
        label="Spawns temporary/randomly"
        description="This node spawns under certain conditions."
        checked={!!details.isTemporary}
        onChange={(event) =>
          onChange({ ...details, isTemporary: event.target.checked })
        }
      />
      <SegmentedControl
        value={details.realm}
        onChange={(value) => onChange({ ...details, realm: value })}
        data={[
          { label: 'All Realms', value: '' },
          { label: 'Live Only', value: 'live' },
        ]}
      />
      <Textarea
        label="Description"
        onChange={(event) =>
          onChange({ ...details, description: event.target.value })
        }
        value={details.description || ''}
        placeholder="Feel free to add more details about this marker"
        rows={2}
      />
    </>
  );
}

export default DetailsInput;
