import leaflet from 'leaflet';
import { useEffect } from 'react';
import { regions } from 'static';
import { useSettingsStore } from '../../utils/settingsStore';

const COLOR = 'rgb(200 200 200)';

function getRegions() {
  return regions.map((region) =>
    leaflet.polygon(region.coordinates as [number, number][], {
      color: COLOR,
      fill: false,
      weight: 1.2,
      interactive: false,
      pmIgnore: true,
    })
  );
}

function useRegionBorders(leafletMap: leaflet.Map | null, show: boolean) {
  const showRegionBorders = useSettingsStore(
    (state) => state.showRegionBorders
  );

  useEffect(() => {
    if (!showRegionBorders || !leafletMap || !show) {
      return;
    }
    const regions = getRegions();

    regions.forEach((region) => region.addTo(leafletMap));
    return () => {
      regions.forEach((region) => region.removeFrom(leafletMap));
    };
  }, [leafletMap, showRegionBorders, show]);
}

export default useRegionBorders;
