import type { Position } from 'aeternum-map-realtime/types';
import leaflet from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findMapDetails, mapIsAeternumMap } from 'static';
import PositionMarker from 'ui/components/WorldMap//PositionMarker';
import { createPlayerIcon } from 'ui/components/WorldMap//playerIcon';
import { useMap } from 'ui/utils/routes';
import { useSettingsStore } from 'ui/utils/settingsStore';
import { usePosition } from '../contexts/PositionContext';

const divElement = leaflet.DomUtil.create('div', 'leaflet-player-position');

function usePlayerPosition({
  leafletMap,
  rotate,
}: {
  isMinimap?: boolean;
  leafletMap: leaflet.Map | null;
  rotate?: boolean;
  isEditing?: boolean;
}): void {
  const [marker, setMarker] = useState<PositionMarker | null>(null);
  const map = useMap();
  const navigate = useNavigate();
  const playerIconColor = useSettingsStore((state) => state.playerIconColor);

  let playerPosition: Position | null = null;
  let playerMap: string | null = null;

  const { position, map: positionMap } = usePosition();
  playerPosition = position;
  playerMap = positionMap;

  const isOnSameWorld = useMemo(
    () => !!playerMap && findMapDetails(playerMap) === findMapDetails(map),
    [playerMap, map]
  );

  useEffect(() => {
    if (playerMap) {
      navigate(
        mapIsAeternumMap(playerMap)
          ? '/'
          : `/${findMapDetails(playerMap)?.title ?? playerMap}`
      );
    }
  }, [playerMap]);

  useEffect(() => {
    if (!leafletMap || !playerPosition || !isOnSameWorld) {
      return;
    }
    const icon = createPlayerIcon(playerIconColor);
    const newMarker = new PositionMarker(playerPosition.location, {
      icon,
      zIndexOffset: 9000,
    });
    newMarker.addTo(leafletMap);
    newMarker.getElement()!.classList.add('leaflet-own-player-marker');
    setMarker(newMarker);

    return () => {
      newMarker.remove();
    };
  }, [leafletMap, Boolean(playerPosition), isOnSameWorld, playerIconColor]);

  useEffect(() => {
    if (
      !marker ||
      !leafletMap ||
      !playerPosition ||
      typeof playerPosition.location?.[0] !== 'number' ||
      typeof playerPosition.location?.[1] !== 'number' ||
      !isOnSameWorld
    ) {
      return;
    }
    const playerImage = marker.getElement();

    const leaftletMapContainer = leafletMap.getContainer();

    if (playerImage) {
      let rotation = playerPosition.rotation - 180;
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
      marker.rotation = newRotation;
      marker.setLatLng(playerPosition.location);

      if (rotate) {
        leaftletMapContainer.style.transform = `rotate(${newRotation * -1}deg)`;
      } else {
        leaftletMapContainer.style.transform = '';
      }

      divElement.innerHTML = `<span>[${playerPosition.location[1]}, ${playerPosition.location[0]}]</span>`;
    }

    leafletMap.panTo([playerPosition.location[0], playerPosition.location[1]], {
      animate: true,
      easeLinearity: 1,
      duration: 1,
      noMoveStart: true,
    });
  }, [marker, leafletMap, playerPosition, rotate, isOnSameWorld]);
}

export default usePlayerPosition;
