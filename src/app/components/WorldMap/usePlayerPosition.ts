import leaflet from 'leaflet';
import { useEffect, useState } from 'react';
import { usePosition } from '../../contexts/PositionContext';
import useWindowIsVisible from '../../utils/useWindowIsVisible';
import type CanvasMarker from './CanvasMarker';
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
  rotate,
}: {
  leafletMap: leaflet.Map | null;
  alwaysFollowing?: boolean;
  rotate?: boolean;
}): void {
  const { position, following } = usePosition();
  const [marker, setMarker] = useState<leaflet.Marker | null>(null);
  const windowIsVisible = useWindowIsVisible();

  useEffect(() => {
    if (!leafletMap) {
      return;
    }
    const icon = new LeafIcon({ iconUrl: '/player.webp' });
    const newMarker = leaflet.marker([0, 0], { icon, zIndexOffset: 9000 });
    newMarker.addTo(leafletMap);
    newMarker.getElement()!.classList.add('leaflet-player-marker');
    setMarker(newMarker);

    return () => {
      newMarker.remove();
    };
  }, [leafletMap]);

  const isFollowing = alwaysFollowing || following;

  useEffect(() => {
    if (!marker || !position || !leafletMap || !windowIsVisible) {
      return;
    }
    marker.setLatLng(position.location);
    const playerImage = marker.getElement();

    const leaftletMapContainer = leafletMap.getContainer();

    let running = true;
    if (playerImage) {
      let rotation = position.rotation - 180;
      const oldRotation =
        +(playerImage.getAttribute('data-rotation') || '0') || rotation;
      let spins = 0;
      if (oldRotation >= 180) {
        spins += Math.floor(Math.abs(oldRotation + 180) / 360);
      } else if (oldRotation <= -180) {
        spins -= Math.floor(Math.abs(oldRotation - 180) / 360);
      }
      rotation += 360 * spins;
      if (oldRotation - rotation >= 180) {
        rotation += 360;
      } else if (rotation - oldRotation >= 180) {
        rotation -= 360;
      }
      playerImage.setAttribute('data-rotation', rotation.toString());

      const newRotation = -rotation - 90;
      playerImage.style.transformOrigin = 'center';
      playerImage.style.transform = `${playerImage.style.transform.replace(
        /\srotate.+/g,
        ''
      )} rotate(${newRotation}deg)`;

      if (rotate) {
        leaftletMapContainer.style.transform = `rotate(${newRotation * -1}deg)`;

        const start = Date.now();
        const visibleMarkers = Object.values(
          // @ts-ignore
          leafletMap.markersLayerGroup._layers
        ) as CanvasMarker[];
        const oldMarkerRotation = visibleMarkers[0]?.options.image.rotate || 0;

        const draw = () => {
          if (!running) {
            return;
          }
          const timeLeft = 1000 - (Date.now() - start);
          const diff = newRotation - oldMarkerRotation;
          const markerRotation =
            oldMarkerRotation + (1 - Math.max(timeLeft, 0) / 1000) * diff;
          // @ts-ignore
          visibleMarkers[0]?._renderer._clear();
          visibleMarkers.forEach((marker) => {
            marker.options.image.rotate = markerRotation;
            marker.redraw();
          });
          if (timeLeft >= 0) {
            setTimeout(() => {
              requestAnimationFrame(draw);
            }, 1);
          }
        };
        requestAnimationFrame(draw);
      } else {
        leaftletMapContainer.style.transform = '';
      }

      divElement.innerHTML = `<span>[${position.location[1]}, ${position.location[0]}]</span>`;
    }

    if (isFollowing) {
      leafletMap.panTo([position.location[0], position.location[1]], {
        animate: true,
        easeLinearity: 1,
        duration: 1,
        noMoveStart: true,
      });
    }
    return () => {
      running = false;
    };
  }, [marker, leafletMap, position, isFollowing, rotate, windowIsVisible]);
}

export default usePlayerPosition;
