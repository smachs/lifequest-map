import leaflet from 'leaflet';
import { useEffect } from 'react';
import { countriesBoundaries } from './geoJson';
import { useSettingsStore } from '../../utils/settingsStore';

const COLOR = 'rgb(54, 53, 53)';

function useRegionBorders(leafletMap: leaflet.Map | null, show: boolean) {
  const showRegionNames = useSettingsStore((state) => state.showRegionNames);

  useEffect(() => {
    if (!leafletMap || !show) {
      return;
    }
    leaflet
      .geoJson(countriesBoundaries, {
        style: {
          color: COLOR,
          fill: false,
          weight: 1.5,
          dashArray: '20, 20',
          dashOffset: '0',
          interactive: false,
        },
        pmIgnore: true,
        onEachFeature: function (feature, layer) {
          layer.bindTooltip(feature.properties.name, {
            permanent: true,
            direction: 'center',
            className: 'leaflet-area-text leaflet-polygon-text',
            interactive: false,
          });
        },
      })
      .addTo(leafletMap);
    // center map in coord
    leafletMap.setView([-23.858882115464976, -46.137723291145029], 6);
  }, [leafletMap, showRegionNames, show]);
}

export default useRegionBorders;
