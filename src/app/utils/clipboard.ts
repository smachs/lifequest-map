import { notify } from './notifications';

export const copyTextToClipboard = (text: string): Promise<void> => {
  return notify(navigator.clipboard.writeText(text), {
    success: 'Copied to clipboard 📝',
  });
};
