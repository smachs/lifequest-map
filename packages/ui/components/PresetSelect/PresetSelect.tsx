import { useState } from 'react';
import { fetchJSON } from '../../utils/api';
import type { Preset } from './presets';
import { staticPresets } from './presets';
import { toast } from 'react-toastify';
import type { AccountDTO } from '../../utils/userStore';
import { useUserStore } from '../../utils/userStore';
import shallow from 'zustand/shallow';
import {
  ActionIcon,
  Button,
  CheckIcon,
  Flex,
  Loader,
  Popover,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconDeviceFloppy, IconTrashX } from '@tabler/icons';
import { useMutation } from '@tanstack/react-query';
import { allFilters, useFiltersStore } from '../../utils/filtersStore';

const updatePresets = (presets: Preset[]) =>
  fetchJSON<AccountDTO>('/api/auth/account', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ presets }),
  });

type PresetSelectProps = {
  onChange: (filters: string[]) => void;
};
function PresetSelect({ onChange }: PresetSelectProps): JSX.Element {
  const { account, setAccount } = useUserStore(
    (state) => ({ account: state.account, setAccount: state.setAccount }),
    shallow
  );
  const [openedAdd, setOpenedAdd] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const { filters } = useFiltersStore();

  const [presetName, setPresetName] = useState('');
  const updateMutation = useMutation(updatePresets, {
    onSuccess: (updatedAccount) => {
      setAccount(updatedAccount);
      setPresetName('');
      setOpenedAdd(false);
    },
  });

  const handleCreate = async () => {
    if (!account || !presetName) {
      return;
    }
    const presets = [...(account.presets || [])];
    if (
      presets.some((preset) => preset.name === presetName) ||
      staticPresets.some((preset) => preset.name === presetName)
    ) {
      toast.error(`Preset ${presetName} already exists 🛑`);
      return;
    }
    const newPreset: Preset = {
      name: presetName,
      types: filters,
    };
    presets.push(newPreset);
    updateMutation.mutate(presets);
  };

  const handleDelete = async (oldPreset: Preset) => {
    if (!account) {
      return;
    }
    const presets = [...(account.presets || [])].filter(
      (preset) => preset.name !== oldPreset.name
    );
    updateMutation.mutate(presets);
  };

  const presets = account?.presets || [];
  return (
    <Flex gap="xs" direction="row" wrap="nowrap">
      <ScrollArea>
        <Button.Group>
          <Button
            compact
            variant="default"
            onClick={() => onChange(allFilters)}
          >
            All
          </Button>
          <Button compact variant="default" onClick={() => onChange([])}>
            None
          </Button>
          {presets.map((preset) => (
            <Button
              key={preset.name}
              compact
              variant="default"
              onClick={() => onChange(preset.types)}
            >
              {preset.name}
            </Button>
          ))}
        </Button.Group>
      </ScrollArea>

      <Flex gap="xs" direction="row" wrap="nowrap" align="center">
        <Popover
          width={200}
          position="bottom"
          withArrow
          shadow="md"
          opened={openedAdd}
          onChange={setOpenedAdd}
        >
          <Popover.Target>
            <ActionIcon
              size="sm"
              variant="default"
              onClick={() => setOpenedAdd((o) => !o)}
              aria-label="Create preset"
            >
              <IconDeviceFloppy />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">
              You can save your selected filters as a preset
            </Text>
            {!account && (
              <Text size="sm" color="orange">
                Please sign-in to use this feature
              </Text>
            )}
            <TextInput
              disabled={!account}
              label="Preset name"
              placeholder="Enter a short name"
              error={(updateMutation.error as Error)?.message}
              rightSection={
                updateMutation.isLoading ? (
                  <Loader size="xs" />
                ) : (
                  <ActionIcon
                    size="xs"
                    onClick={handleCreate}
                    disabled={!presetName}
                    variant="transparent"
                    color="green"
                    aria-label="Save preset"
                  >
                    <CheckIcon width="100%" height="100%" />
                  </ActionIcon>
                )
              }
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
            />
          </Popover.Dropdown>
        </Popover>
        <Popover
          width={200}
          position="bottom"
          withArrow
          shadow="md"
          opened={openedDelete}
          onChange={setOpenedDelete}
        >
          <Popover.Target>
            <ActionIcon
              size="sm"
              variant="default"
              onClick={() => setOpenedDelete((o) => !o)}
              disabled={presets.length === 0}
              aria-label="Delete preset"
            >
              <IconTrashX />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack spacing="xs">
              <Text size="sm">Click on a preset you like to delete</Text>
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  onClick={() => handleDelete(preset)}
                  compact
                  color="red"
                  fullWidth
                >
                  {preset.name}
                </Button>
              ))}
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Flex>
    </Flex>
  );
}

export default PresetSelect;
