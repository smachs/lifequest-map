import leaflet from 'leaflet';
import { AETERNUM_MAP } from 'static';
import { useSettingsStore } from '../../utils/settingsStore';

type LiveCharacter = {
  position: {
    location: [number, number];
    rotation: number;
  };
  location: string;
  region: string;
  worldName: string;
  map: string;
};

const UPDATE_INTERVAL = 1500;
let cache: Promise<LiveCharacter[]> | null = null;
let lastUpdate = 0;
const fetchPlayers = async () => {
  if (!cache || Date.now() - lastUpdate > UPDATE_INTERVAL) {
    cache = Promise.all<LiveCharacter[]>([
      fetch('https://live1.aeternum-map.gg/api/live').then((response) =>
        response.json()
      ),
      fetch('https://live2.aeternum-map.gg/api/live').then((response) =>
        response.json()
      ),
    ]).then(([live1, live2]) =>
      [...live1, ...live2].filter(({ map }) => map === AETERNUM_MAP.name)
    );
    lastUpdate = Date.now();
  }
  return cache;
};

export const initOtherPlayers = (leafletMap: leaflet.Map) => {
  const layerGroup = leaflet.layerGroup();
  layerGroup.addTo(leafletMap);
  let timeoutId: NodeJS.Timeout | null = null;
  useSettingsStore.subscribe(
    (state) => [
      state.showOtherPlayers,
      state.otherPlayersWorldName,
      state.otherPlayersSize,
    ],
    async ([showOtherPlayers, otherPlayersWorldName, otherPlayersSize]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      layerGroup.clearLayers();

      if (showOtherPlayers) {
        const updateOtherPlayers = async (leafletMap: leaflet.Map) => {
          const players = await fetchPlayers();
          const state = useSettingsStore.getState();
          if (
            !state.showOtherPlayers ||
            state.otherPlayersWorldName !== otherPlayersWorldName ||
            state.otherPlayersSize !== otherPlayersSize
          ) {
            return;
          }
          layerGroup.addTo(leafletMap);
          layerGroup.clearLayers();
          const visiblePlayers = otherPlayersWorldName
            ? players.filter(
                (player) => player.worldName === otherPlayersWorldName
              )
            : players;
          visiblePlayers.forEach(({ position }) => {
            if (position.location[0] && position.location[1]) {
              const circle = leaflet.circle(
                [position.location[0], position.location[1]],
                {
                  fillOpacity: 0.8,
                  radius: state.otherPlayersSize,
                  stroke: true,
                  color: 'white',
                  fillColor: 'white',
                  interactive: false,
                }
              );
              circle.addTo(layerGroup);
            }
          });
          timeoutId = setTimeout(async () => {
            await updateOtherPlayers(leafletMap);
          }, UPDATE_INTERVAL);
        };
        await updateOtherPlayers(leafletMap);
      }
    },
    { fireImmediately: true }
  );
};
