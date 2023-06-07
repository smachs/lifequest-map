import leaflet from 'leaflet';
import { useEffect } from 'react';
import { regions } from 'static';
import { useSettingsStore } from '../../utils/settingsStore';

const COLOR = 'rgb(200 200 200)';

function getRegions() {
  return regions.map((region) => ({
    name: region.name,
    polygons: leaflet.polygon(region.coordinates as [number, number][], {
      color: COLOR,
      fill: false,
      weight: 1.2,
      interactive: false,
      pmIgnore: true,
    }),
  }));
}
function useRegionBorders(leafletMap: leaflet.Map | null, show: boolean) {
  const showRegionNames = useSettingsStore((state) => state.showRegionNames);

  useEffect(() => {
    if (!leafletMap || !show) {
      return;
    }
    const regionsGroup = new leaflet.FeatureGroup();
    regionsGroup.addTo(leafletMap);

    const regions = getRegions();

    regions.forEach((region) => {
      region.polygons.addTo(regionsGroup);
      if (showRegionNames) {
        const textLabel = leaflet.marker(region.polygons.getCenter(), {
          icon: leaflet.divIcon({
            className: 'leaflet-polygon-text',
            html: `<div class="leaflet-area-text">${region.name}</div>`,
          }),
          interactive: false,
        });
        textLabel.addTo(regionsGroup);
      }
    });
    return () => {
      regionsGroup.removeFrom(leafletMap);
    };
  }, [leafletMap, showRegionNames, show]);
}

export default useRegionBorders;
