import {
  Anchor,
  Button,
  Paper,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import useSWR from 'swr';
import { useAccountStore } from 'ui/utils/account';
import { promisifyOverwolf } from 'ui/utils/wrapper';

export default function Channels() {
  const previewAccess = useAccountStore((state) => state.previewAccess);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: extensionSettings, mutate: refreshExtensionSettings } = useSWR(
    'extensionSettings',
    () => promisifyOverwolf(overwolf.settings.getExtensionSettings)()
  );
  const { data: manifest } = useSWR('manifest', () =>
    promisifyOverwolf(overwolf.extensions.current.getManifest)()
  );
  const { data: extensionUpdate, mutate: refreshCheckForExtensionUpdate } =
    useSWR('extensionUpdate', () =>
      promisifyOverwolf(overwolf.extensions.checkForExtensionUpdate)()
    );

  const version = manifest?.meta.version;
  const channel = extensionSettings?.settings?.channel || 'production';
  let state = extensionUpdate?.state || 'UpToDate';
  if (version === extensionUpdate?.updateVersion) {
    state = 'UpToDate';
  }
  return (
    <Paper p="sm">
      <Stack>
        <Title order={2} size="sm" align="center">
          App Status
        </Title>
        <Switch
          label="Preview Access"
          checked={channel === 'preview-access'}
          onChange={(checked) => {
            promisifyOverwolf(overwolf.settings.setExtensionSettings)({
              channel: checked ? 'preview-access' : 'production',
            })
              .then(() => refreshExtensionSettings())
              .then(() => refreshCheckForExtensionUpdate())
              .catch(console.error);
          }}
          disabled={!previewAccess}
        />
        <Text size="xs" color="dimmed">
          By activating preview access, you will get the latest features before
          they are released to the public. This perk is only available for{' '}
          <Anchor
            href="https://www.th.gl/support-me"
            target="_blank"
            className="hover:text-white text-brand"
          >
            Elite Supporters
          </Anchor>
          .
        </Text>
        <Text>
          Version{' '}
          <Text component="span" color="green" weight="bold">
            v{version}
          </Text>
          <Anchor
            href="https://www.th.gl/apps/Aeternum%20Map/release-notes"
            target="_blank"
            ml="md"
          >
            Release Notes
          </Anchor>
        </Text>

        <Text size="xs" color="dimmed">
          {state === 'UpToDate' &&
            'You are running the latest version of the app.'}
          {state === 'UpdateAvailable' && !isUpdating && (
            <>
              An update is available.{' '}
              <Button
                className="hover:text-white text-brand"
                onClick={() => {
                  setIsUpdating(true);
                  promisifyOverwolf(overwolf.extensions.updateExtension)()
                    .then(() => refreshCheckForExtensionUpdate())
                    .catch(console.error)
                    .finally(() => setIsUpdating(false));
                }}
              >
                Update Now!
              </Button>
            </>
          )}
          {state === 'UpdateAvailable' && isUpdating && 'Updating...'}
          {state === 'PendingRestart' && (
            <>
              An update was installed. Restart the app to apply the update.{' '}
              <Button
                className="hover:text-white text-brand"
                onClick={() => overwolf.extensions.relaunch()}
              >
                Restart Now!
              </Button>
            </>
          )}
        </Text>
      </Stack>
    </Paper>
  );
}
