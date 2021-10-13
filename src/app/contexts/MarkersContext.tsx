import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchJSON } from '../utils/api';

export type Marker = {
  type: string;
  position?: [number, number, number];
  positions?: [number, number][];
  name?: string;
  level?: number;
  levelRange?: [number, number];
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  username?: string;
  _id: string;
};

type MarkersContextProps = { markers: Marker[]; refresh: () => void };
const MarkersContext = createContext<MarkersContextProps>({
  markers: [],
  refresh: () => undefined,
});

type MarkersProviderProps = {
  children: ReactNode;
};

export function MarkersProvider({
  children,
}: MarkersProviderProps): JSX.Element {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const refresh = useCallback(() => {
    fetchJSON<Marker[]>('/api/markers').then(setMarkers);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <MarkersContext.Provider value={{ markers, refresh }}>
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers(): MarkersContextProps {
  return useContext(MarkersContext);
}
