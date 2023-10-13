import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Store = {
  isPTR: boolean;
  setIsPTR: (value: boolean) => void;
};

export const useRealmStore = create(
  persist<Store>(
    (set) => {
      return {
        isPTR: false,
        setIsPTR: (isPTR) => {
          const searchParams = new URLSearchParams(location.search);
          if (isPTR) {
            searchParams.set('realm', 'ptr');
          } else {
            searchParams.delete('realm');
          }
          history.replaceState(
            null,
            '',
            `${location.pathname}?${searchParams.toString()}`
          );
          set({ isPTR });
        },
      };
    },
    {
      name: 'realm-store',
      merge: (persistedState, currentState) => {
        const searchParams = new URLSearchParams(location.search);
        const realm = searchParams.get('realm');
        let isPTR = false;
        if (realm) {
          isPTR = realm === 'ptr';
        } else if (
          typeof persistedState === 'object' &&
          persistedState !== null &&
          'isPTR' in persistedState &&
          typeof persistedState.isPTR === 'boolean'
        ) {
          isPTR = persistedState.isPTR;

          if (isPTR) {
            searchParams.set('realm', 'ptr');
          } else {
            searchParams.delete('realm');
          }
          const searchParamsString = searchParams.toString();
          history.replaceState(
            null,
            '',
            `${location.pathname}${
              searchParamsString ? `?${searchParamsString}` : ''
            }`
          );
        }

        return { ...currentState, isPTR: isPTR };
      },
    }
  )
);
