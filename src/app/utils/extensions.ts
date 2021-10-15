import { getJSONItem, setJSONItem } from './storage';

export function getAppVersion(): Promise<string> {
  return new Promise<string>((resolve) => {
    overwolf.extensions.current.getManifest((manifest) =>
      resolve(`v${manifest.meta.version}`)
    );
  });
}

export async function isAppUpdated(): Promise<boolean> {
  const lastVersion = getJSONItem('lastVersion', '');
  const version = await getAppVersion();
  const isUpdated = version !== lastVersion;
  setJSONItem('lastVersion', version);
  return isUpdated;
}
