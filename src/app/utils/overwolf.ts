import { writeLog } from './logs';

// Sometimes `overwolf` is not loaded if debug_url is set. A simple reload of the page will fix this.
export function waitForOverwolf(): Promise<void> {
  return new Promise((resolve) => {
    function isOverwolfLoading() {
      return (
        navigator.userAgent.includes('OverwolfClient') &&
        typeof overwolf === 'undefined'
      );
    }
    if (!isOverwolfLoading()) {
      overwolf.extensions.current.getManifest((manifest) =>
        writeLog(`v${manifest.meta.version}`)
      );
      resolve();
    } else {
      writeLog('Overwolf is not ready...');
      setTimeout(() => {
        if (isOverwolfLoading()) {
          writeLog('Overwolf is still loading...reloading');
          location.reload();
        } else {
          resolve();
        }
      }, 1000);
    }
  });
}
