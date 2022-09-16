import { notify } from './notifications';
import { isOverwolfApp } from './overwolf';

export const copyTextToClipboard = (text: string): Promise<void> => {
  const action = isOverwolfApp
    ? new Promise<void>((resolve) => {
        resolve(overwolf.utils.placeOnClipboard(text));
      })
    : navigator.clipboard.writeText(text);

  return notify(action, {
    success: 'Copied to clipboard 📝',
  });
};
