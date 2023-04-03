import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { getJSONItem, withStorageDOMEvents } from './storage';

type Store = {
  liveShareServerUrl: string;
  setLiveShareServerUrl: (liveShareServerUrl: string) => void;
  liveShareToken: string;
  setLiveShareToken: (liveShareToken: string) => void;
  following: boolean;
  toggleFollowing: () => void;
  showOtherPlayers: boolean;
  toggleShowOtherPlayers: () => void;
  showOtherRespawnTimers: boolean;
  toggleShowOtherRespawnTimers: () => void;
  otherPlayersWorldName: string | null;
  setOtherPlayersWorldName: (otherPlayersWorldName: string | null) => void;
  otherPlayersSize: number;
  setOtherPlayersSize: (otherPlayersSize: number) => void;
  autoFade: boolean;
  toggleAutoFade: () => void;
  traceLineRate: number;
  setTraceLineRate: (traceLineRate: number) => void;
  markerSize: number;
  setMarkerSize: (markerSize: number) => void;
  markerShowBackground: boolean;
  setMarkerShowBackground: (markerShowBackground: boolean) => void;
  showRegionBorders: boolean;
  setShowRegionBorders: (showRegionBorders: boolean) => void;
  maxTraceLines: number;
  setMaxTraceLines: (maxTraceLines: number) => void;
  showTraceLines: boolean;
  setShowTraceLines: (showTraceLines: boolean) => void;
  showPlayerNames: boolean;
  setShowPlayerNames: (showPlayerNames: boolean) => void;
  alwaysShowDirection: boolean;
  setAlwaysShowDirection: (alwaysShowDirection: boolean) => void;
  adaptiveZoom: boolean;
  setAdaptiveZoom: (adaptiveZoom: boolean) => void;
  traceLineColor: string;
  setTraceLineColor: (traceLineColor: string) => void;
  playerIconColor: string;
  setPlayerIconColor: (playerIconColor: string) => void;
  peerToPeer: boolean;
  setPeerToPeer: (peerToPeer: boolean) => void;
  overlayMode: boolean | null;
  setOverlayMode: (overlayMode: boolean) => void;
};

export const useSettingsStore = create(
  subscribeWithSelector(
    persist<Store>(
      (set) => ({
        liveShareServerUrl: getJSONItem('live-share-server-url', ''), // Deprecated
        setLiveShareServerUrl: (liveShareServerUrl) =>
          set({ liveShareServerUrl }),
        liveShareToken: getJSONItem('live-share-token', ''), // Deprecated
        setLiveShareToken: (liveShareToken) => set({ liveShareToken }),
        following: true,
        toggleFollowing: () =>
          set((state) => ({ following: !state.following })),
        showOtherPlayers: false,
        toggleShowOtherPlayers: () =>
          set((state) => ({ showOtherPlayers: !state.showOtherPlayers })),
        showOtherRespawnTimers: false,
        toggleShowOtherRespawnTimers: () =>
          set((state) => ({
            showOtherRespawnTimers: !state.showOtherRespawnTimers,
          })),
        otherPlayersWorldName: null,
        setOtherPlayersWorldName: (otherPlayersWorldName) =>
          set({ otherPlayersWorldName }),
        otherPlayersSize: 10,
        setOtherPlayersSize: (otherPlayersSize) => set({ otherPlayersSize }),
        autoFade: true,
        toggleAutoFade: () => set((state) => ({ autoFade: !state.autoFade })),
        traceLineRate: 250,
        setTraceLineRate: (traceLineRate) => set({ traceLineRate }),
        markerSize: getJSONItem('markerSize', 27),
        setMarkerSize: (markerSize) => set({ markerSize }),
        markerShowBackground: getJSONItem('markerShowBackground', false),
        setMarkerShowBackground: (markerShowBackground) =>
          set({ markerShowBackground }),
        showRegionBorders: getJSONItem('showRegionBorders', true),
        setShowRegionBorders: (showRegionBorders) => set({ showRegionBorders }),
        maxTraceLines: getJSONItem('max-trace-lines', 250),
        setMaxTraceLines: (maxTraceLines) => set({ maxTraceLines }),
        showTraceLines: getJSONItem('show-trace-lines', true),
        setShowTraceLines: (showTraceLines) => set({ showTraceLines }),
        showPlayerNames: getJSONItem('show-player-names', false),
        setShowPlayerNames: (showPlayerNames) => set({ showPlayerNames }),
        alwaysShowDirection: getJSONItem('always-show-direction', false),
        setAlwaysShowDirection: (alwaysShowDirection) =>
          set({ alwaysShowDirection }),
        adaptiveZoom: getJSONItem('adaptive-zoom', true),
        setAdaptiveZoom: (adaptiveZoom) => set({ adaptiveZoom }),
        traceLineColor: getJSONItem('trace-line-color', '#F78166'),
        setTraceLineColor: (traceLineColor) => set({ traceLineColor }),
        playerIconColor: getJSONItem('player-icon-color', '#FEFEFE'),
        setPlayerIconColor: (playerIconColor) => set({ playerIconColor }),
        peerToPeer: getJSONItem('peer-to-peer', true),
        setPeerToPeer: (peerToPeer) => set({ peerToPeer }),
        overlayMode: null,
        setOverlayMode: (overlayMode) => set({ overlayMode }),
      }),
      {
        name: 'settings-store',
      }
    )
  )
);

withStorageDOMEvents(useSettingsStore);
