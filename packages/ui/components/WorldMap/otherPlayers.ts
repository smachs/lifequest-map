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

const PLAYERS_UPDATE_INTERVAL = 1500;
let playersCache: Promise<LiveCharacter[]> | null = null;
let lastPlayersUpdate = 0;
const fetchPlayers = async () => {
  if (
    !playersCache ||
    Date.now() - lastPlayersUpdate > PLAYERS_UPDATE_INTERVAL
  ) {
    playersCache = Promise.all<LiveCharacter[]>([
      fetch('https://live1.aeternum-map.gg/api/live').then((response) =>
        response.json()
      ),
      fetch('https://live2.aeternum-map.gg/api/live').then((response) =>
        response.json()
      ),
    ]).then(([live1, live2]) =>
      [...live1, ...live2].filter(({ map }) => map === AETERNUM_MAP.name)
    );
    lastPlayersUpdate = Date.now();
  }
  return playersCache;
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
          const round = (value: number) => {
            return Math.round(value / 25) * 25;
          };

          const groups = visiblePlayers.reduce(
            (prev, curr) => {
              if (!curr.position.location[0] || !curr.position.location[1]) {
                return prev;
              }
              const location = [
                round(curr.position.location[0]),
                round(curr.position.location[1]),
              ] as [number, number];
              const key = `${location[0]}:${location[1]}`;
              return {
                ...prev,
                [key]: {
                  location,
                  count: (prev[key]?.count || 0) + 1,
                },
              };
            },
            {} as {
              [key: string]: {
                location: [number, number];
                count: number;
              };
            }
          );
          Object.values(groups).forEach((value) => {
            let color;
            if (value.count > 10) {
              color = '#9e1313';
            } else if (value.count > 7) {
              color = '#e60000';
            } else if (value.count > 2) {
              color = '#f07d02';
            } else {
              color = '#84ca50';
            }
            const circle = leaflet.circle(value.location, {
              fillOpacity: 0.8,
              radius: state.otherPlayersSize,
              stroke: true,
              color: color,
              fillColor: color,
              interactive: false,
            });
            circle.addTo(layerGroup);
          });
          timeoutId = setTimeout(async () => {
            await updateOtherPlayers(leafletMap);
          }, PLAYERS_UPDATE_INTERVAL);
        };
        await updateOtherPlayers(leafletMap);
      }
    },
    { fireImmediately: true }
  );
};
