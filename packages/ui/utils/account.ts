import { mutate } from 'swr';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { withStorageDOMEvents } from './dom';
import { isOverwolfApp } from './overwolf';
import { promisifyOverwolf } from './wrapper';

export const useAccountStore = create(
  persist<{
    userId: string | null;
    isPatron: boolean;
    previewAccess: boolean;
    setIsPatron: (
      isPatron: boolean,
      userId?: string | null,
      previewAccess?: boolean
    ) => void;
  }>(
    (set, get) => ({
      userId: null,
      isPatron: false,
      previewAccess: false,
      setIsPatron: (isPatron, userId, previewAccess) => {
        if (isOverwolfApp) {
          const prevUserId = get().userId;
          if (!prevUserId && previewAccess) {
            promisifyOverwolf(overwolf.settings.setExtensionSettings)({
              channel: 'preview-access',
            }).then(() => mutate('extensionSettings'));
          } else if (prevUserId && !previewAccess) {
            promisifyOverwolf(overwolf.settings.setExtensionSettings)({
              channel: 'production',
            }).then(() => mutate('extensionSettings'));
          }
        }
        set({
          isPatron,
          userId: userId || null,
          previewAccess: previewAccess || false,
        });
      },
    }),
    {
      name: 'account-storage',
    }
  )
);

withStorageDOMEvents(useAccountStore);
