import { useEffect, useState } from 'react';
import type { AccountDTO } from '../../contexts/UserContext';
import { useAccount } from '../../contexts/UserContext';
import { fetchJSON } from '../../utils/api';
import { writeError } from '../../utils/logs';
import { notify } from '../../utils/notifications';
import { getJSONItem } from '../../utils/storage';
import type { Preset } from './presets';
import { staticPresets } from './presets';
import styles from './PresetSelect.module.css';
import { toast } from 'react-toastify';
import { useModal } from '../../contexts/ModalContext';
import Confirm from '../Confirm/Confirm';
import { escapeRegExp } from '../../utils/regExp';

type PresetSelectProps = {
  value: Preset | null;
  onChange: (value: Preset | null) => void;
};
function PresetSelect({ value, onChange }: PresetSelectProps): JSX.Element {
  const { account, setAccount } = useAccount();
  const [search, setSearch] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const { addModal } = useModal();

  useEffect(() => {
    if (!isFocus) {
      setSearch('');
    }
  }, [value, isFocus]);

  const regExp = new RegExp(escapeRegExp(search), 'ig');

  const handleCreateClick = async () => {
    try {
      if (!account) {
        return;
      }
      const presets = [...(account.presets || [])];
      if (
        presets.some((preset) => preset.name === search) ||
        staticPresets.some((preset) => preset.name === search)
      ) {
        toast.error(`Preset ${search} already exists 🛑`);
        return;
      }
      const newPreset: Preset = {
        name: search,
        types: getJSONItem('selected-filters', []),
      };
      presets.push(newPreset);

      const updatedAccount = await notify(
        fetchJSON<AccountDTO>('/api/auth/account', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ presets }),
        }),
        {
          success: 'Preset added 👌',
        }
      );
      setAccount(updatedAccount);
      onChange(newPreset);
      setSearch('');
    } catch (error) {
      writeError(error);
    }
  };

  const handleDeleteClick = async (oldPreset: Preset) => {
    try {
      if (!account) {
        return;
      }
      const presets = [...(account.presets || [])].filter(
        (preset) => preset.name !== oldPreset.name
      );

      const updatedAccount = await notify(
        fetchJSON<AccountDTO>('/api/auth/account', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ presets }),
        }),
        {
          success: 'Preset deleted 👌',
        }
      );
      setAccount(updatedAccount);
      if (value?.name === oldPreset.name) {
        onChange(null);
      }
      setSearch('');
    } catch (error) {
      writeError(error);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.select}>
        <input
          value={isFocus ? search : value?.name || ''}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Select or create preset..."
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          maxLength={18}
        />
      </label>
      {isFocus && (
        <div className={styles.list}>
          {staticPresets
            .filter((preset) => preset.name.match(regExp))
            .map((preset) => (
              <button
                key={preset.name}
                className={styles.option}
                onMouseDown={() => onChange(preset)}
              >
                {preset.name}
              </button>
            ))}
          {account?.presets
            ?.filter((preset) => preset.name.match(regExp))
            .map((preset) => (
              <div key={preset.name} className={styles.row}>
                <button
                  className={styles.option}
                  key={preset.name}
                  onMouseDown={() => onChange(preset)}
                >
                  {preset.name}
                </button>
                <button
                  className={styles.option}
                  onMouseDown={() => {
                    addModal({
                      title: 'Do you really want to delete this preset?',
                      children: (
                        <Confirm onConfirm={() => handleDeleteClick(preset)} />
                      ),
                      fitContent: true,
                    });
                  }}
                >
                  💀
                </button>
              </div>
            ))}
          {search && (
            <button
              className={styles.option}
              disabled={!account}
              onMouseDown={handleCreateClick}
            >
              {account ? `Create "${search}"` : 'Login to create preset'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PresetSelect;
