import { useEffect, useState } from 'react';
import useLayerGroups from '../WorldMap/useLayerGroups';
import useWorldMap from '../WorldMap/useWorldMap';
import styles from './SelectRoute.module.css';
import 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import type { Polyline } from 'leaflet';
import leaflet from 'leaflet';
import MarkerTypes from './MarkerTypes';
import { fetchJSON } from '../../utils/api';
import { useModal } from '../../contexts/ModalContext';
import { useUser } from '../../contexts/UserContext';
import type { MarkerRouteItem } from './MarkerRoutes';

function createUndoControl(onClick: () => void): leaflet.Control {
  const revertControl = new leaflet.Control({ position: 'topleft' });
  revertControl.onAdd = () => {
    const button = leaflet.DomUtil.create('button', 'leaflet-revert'); // create a div with a class "info"
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>';
    button.onclick = (event) => {
      event.stopPropagation();
      onClick();
    };
    return button;
  };
  return revertControl;
}

type SelectRouteProps = {
  onAdd: (markerRoute: MarkerRouteItem) => void;
};
type MarkerBase = { _id: string; type: string };
function SelectRoute({ onAdd }: SelectRouteProps): JSX.Element {
  const { closeLatestModal } = useModal();
  const [positions, setPositions] = useState<[number, number][]>([]);
  const { leafletMap, elementRef } = useWorldMap({ selectMode: true });
  const [markersByType, setMarkersByType] = useState<{
    [type: string]: number;
  }>({});
  const [name, setName] = useState('');
  const user = useUser();

  useLayerGroups({
    leafletMap,
    pmIgnore: false,
  });

  useEffect(() => {
    if (!leafletMap) {
      return;
    }

    const revertControl = createUndoControl(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const line = leafletMap.pm.Draw.Line as {
        _removeLastVertex: () => void;
      };
      if (!line) {
        return;
      }
      line._removeLastVertex();

      const lastMarker = selectedMarkers.pop();
      if (!lastMarker) {
        return;
      }
      const type = lastMarker.type;
      setMarkersByType((prev) => {
        const markersByTypeCopy = { ...prev };
        const count = (prev[type] || 1) - 1;
        if (count > 0) {
          markersByTypeCopy[type] = count;
        } else {
          delete markersByTypeCopy[type];
        }
        return markersByTypeCopy;
      });
    });
    revertControl.addTo(leafletMap);

    const selectedMarkers: (MarkerBase | null)[] = [];
    leafletMap.on('pm:create', (event) => {
      if (event.shape === 'Line') {
        const latLngs = (
          event.layer as Polyline
        ).getLatLngs() as leaflet.LatLng[];
        const positions = latLngs.map((latLng) => [latLng.lat, latLng.lng]) as [
          number,
          number
        ][];
        setPositions(positions);
        revertControl.remove();
      }
    });

    // listen to vertexes being added to currently drawn layer (called workingLayer)
    leafletMap.on('pm:drawstart', ({ workingLayer }) => {
      if (!(workingLayer instanceof leaflet.Polyline)) {
        return;
      }
      let snappedMarker: MarkerBase | undefined = undefined;

      workingLayer.on('pm:vertexadded', () => {
        if (snappedMarker) {
          selectedMarkers.push(snappedMarker);
          const type = snappedMarker.type;
          setMarkersByType((prev) => ({
            ...prev,
            [type]: (prev[type] || 0) + 1,
          }));
        } else {
          selectedMarkers.push(null);
        }
      });

      workingLayer.on('pm:snap', (event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const imageOptions = event.layerInteractedWith?.options?.image;
        if (!imageOptions) {
          return;
        }
        snappedMarker = {
          _id: imageOptions.markerId,
          type: imageOptions.type,
        };
      });
      workingLayer.on('pm:unsnap', () => {
        snappedMarker = undefined;
      });
    });

    leafletMap.pm.enableDraw('Line', { finishOn: 'contextmenu' });

    return () => {
      leafletMap.off('pm:create');
      leafletMap.off('pm:drawstart');
      leafletMap.off('pm:vertexadded');
      leafletMap.off('pm:snap');
      leafletMap.off('pm:unsnap');
    };
  }, [leafletMap]);

  function handleSave() {
    fetchJSON<MarkerRouteItem>('/api/marker-routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        username: user?.username,
        positions,
        markersByType,
      }),
    })
      .then(onAdd)
      .then(closeLatestModal);
  }

  return (
    <div className={styles.container}>
      <aside>
        <small>Only selected markers are visible on this map</small>
        <label className={styles.label}>
          Name
          <input
            onChange={(event) => setName(event.target.value)}
            value={name || ''}
            placeholder="Give this route an explanatory name"
            required
            autoFocus
          />
        </label>
        <MarkerTypes markersByType={markersByType} />
      </aside>
      <div className={styles.map} ref={elementRef} />
      <button
        className={styles.save}
        onClick={handleSave}
        disabled={
          !name || !Object.keys(markersByType).length || positions.length === 0
        }
      >
        Save Position
      </button>
    </div>
  );
}

export default SelectRoute;
