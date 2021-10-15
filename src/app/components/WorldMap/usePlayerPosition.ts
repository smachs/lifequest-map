import leaflet from 'leaflet';
import { useEffect, useState } from 'react';
import { usePosition } from '../../contexts/PositionContext';
import { LeafIcon } from './useLayerGroups';

const divElement = leaflet.DomUtil.create('div', 'leaflet-player-position');
const CoordinatesControl = leaflet.Control.extend({
  onAdd() {
    return divElement;
  },
});
export const coordinates = new CoordinatesControl({ position: 'bottomright' });

function usePlayerPosition({
  leafletMap,
  alwaysFollowing,
}: {
  leafletMap: leaflet.Map | null;
  alwaysFollowing?: boolean;
}): void {
  const { position, following } = usePosition();
  const [marker, setMarker] = useState<leaflet.Marker | null>(null);

  useEffect(() => {
    if (!leafletMap || marker || !position) {
      return;
    }
    const icon = new LeafIcon({ iconUrl: '/player.webp' });
    const newMarker = leaflet.marker([0, 0], { icon, zIndexOffset: 9000 });
    newMarker.addTo(leafletMap);
    newMarker.getElement()!.classList.add('leaflet-player-marker');
    setMarker(newMarker);
  }, [leafletMap, marker, position]);

  const isFollowing = alwaysFollowing || following;
  useEffect(() => {
    if (!marker || !position || !leafletMap) {
      return;
    }
    const oldLatLng = marker.getLatLng();
    if (oldLatLng.lat === position[0] && oldLatLng.lng === position[1]) {
      return;
    }
    marker.setLatLng(position);
    const playerImage = marker.getElement();
    if (playerImage) {
      const theta =
        (Math.atan2(oldLatLng.lat - position[0], oldLatLng.lng - position[1]) *
          180) /
        Math.PI;

      playerImage.style.transformOrigin = 'center';
      playerImage.style.transform = `${playerImage.style.transform.replace(
        /\srotate.+/g,
        ''
      )} rotate(${-theta - 90}deg)`;

      divElement.innerHTML = `<span>[${position[1]}, ${position[0]}]</span>`;
    }

    if (isFollowing) {
      leafletMap.panTo([position[0], position[1]], {
        animate: true,
        easeLinearity: 1,
        duration: 1,
        noMoveStart: true,
      });
    }
  }, [marker, leafletMap, position, isFollowing]);
}

export default usePlayerPosition;
