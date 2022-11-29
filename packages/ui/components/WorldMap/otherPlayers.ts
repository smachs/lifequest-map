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

const fetchPlayers = async () => {
  const [live1, live2] = await Promise.all<LiveCharacter[]>([
    fetch('https://live1.aeternum-map.gg/api/live').then((response) =>
      response.json()
    ),
    fetch('https://live2.aeternum-map.gg/api/live').then((response) =>
      response.json()
    ),
  ]);
  return [...live1, ...live2].filter(({ map }) => map === AETERNUM_MAP.name);
};

export const initOtherPlayers = (leafletMap: leaflet.Map) => {
  const layerGroup = leaflet.layerGroup();
  layerGroup.addTo(leafletMap);
  let timeoutId: NodeJS.Timeout | null = null;
  useSettingsStore.subscribe(
    (state) => state.showOtherPlayers,
    async (showOtherPlayers) => {
      if (showOtherPlayers) {
        const updateOtherPlayers = async (leafletMap: leaflet.Map) => {
          const players = await fetchPlayers();
          if (!useSettingsStore.getState().showOtherPlayers) {
            return;
          }
          layerGroup.addTo(leafletMap);
          layerGroup.clearLayers();
          players.forEach(({ position }) => {
            if (position.location[0] && position.location[1]) {
              const circle = leaflet.circle(
                [position.location[0], position.location[1]],
                {
                  fillOpacity: 0.8,
                  radius: 5,
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
          }, 1500);
        };
        await updateOtherPlayers(leafletMap);
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        layerGroup.clearLayers();
      }
    },
    { fireImmediately: true }
  );
};
