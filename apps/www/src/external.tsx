import { Box, Button } from '@mantine/core';
import { IconMap } from '@tabler/icons-react';
import leaflet from 'leaflet';
import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AETERNUM_MAP, findMapDetails, regions } from 'static';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';
import createCanvasLayer from 'ui/components/WorldMap/CanvasLayer';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { initPlausible } from 'ui/utils/stats';

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

function postMessageToParent(type: string, payload?: any) {
  if (typeof payload !== 'undefined') {
    window.parent.postMessage({ type, payload }, '*');
  } else {
    window.parent.postMessage({ type }, '*');
  }
}

export default function External() {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mapParam = searchParams.get('map') ?? 'NewWorld_VitaeEterna';
    const zoomParam = searchParams.get('zoom');
    const centerParam = searchParams.get('center');
    const fit = searchParams.get('fit') === 'true';

    const mapDetail = findMapDetails(mapParam) ?? AETERNUM_MAP;
    const latLngBounds = leaflet.latLngBounds(mapDetail.maxBounds);

    const worldCRS = leaflet.extend({}, leaflet.CRS.Simple, {
      transformation: new leaflet.Transformation(1 / 16, 0, -1 / 16, 0),
    });

    const map = leaflet.map(elementRef.current!, {
      preferCanvas: true,
      crs: worldCRS,
      attributionControl: false,
      zoomControl: false,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
      minZoom: -2,
      maxZoom: mapDetail.maxZoom + 2,
      center: latLngBounds.getCenter(),
    });

    map.on('contextmenu', () => {
      // Disable default context menu
    });

    if (zoomParam && centerParam) {
      const center = JSON.parse(centerParam);
      const zoom = parseFloat(zoomParam);
      map.setView(center, zoom, {
        animate: false,
        noMoveStart: true,
      });
    } else if (!fit) {
      map.fitBounds(latLngBounds, {
        animate: false,
        noMoveStart: true,
      });
    }

    const isPTR = searchParams.get('realm') === 'ptr';
    const CanvasLayer = createCanvasLayer(mapDetail, isPTR);
    const worldTiles = new CanvasLayer();
    worldTiles.addTo(map);

    let regions: leaflet.Polygon<any>[] = [];
    if (mapDetail.name === AETERNUM_MAP.name) {
      regions = getRegions();
      regions.forEach((region) => region.addTo(map));
    }

    let geoJSON: leaflet.GeoJSON | null = null;
    const handleMessage = (event: MessageEvent<any>) => {
      const data = event.data;
      switch (data.type) {
        case 'SET_EXTERNAL_DATA':
          if (geoJSON) {
            geoJSON.remove();
          }
          geoJSON = leaflet.geoJSON(data.payload, {
            pointToLayer: (feature, latlng) =>
              leaflet.circleMarker(latlng, {
                stroke: true,
                color: feature.properties['circle-stroke-color'],
                fillColor: feature.properties['circle-color'],
                weight: feature.properties['circle-stroke-width'],
                radius: feature.properties['circle-radius'],
                opacity: feature.properties['circle-opacity'],
                fillOpacity: 1,
              }),
            onEachFeature: (feature, layer) => {
              layer.on('click', () => {
                postMessageToParent('click', feature);
              });
              if (feature.properties.title) {
                layer.bindTooltip(() => feature.properties.title);
              }
            },
            style: (feature: any) => ({
              stroke: true,
              color: feature.properties['fill-outline-color'],
              fillColor: feature.properties['fill-color'],
              opacity: 1,
              fillOpacity: feature.properties['fill-opacity'],
              weight: 1,
              interactive:
                feature.properties.interactive ??
                feature.geometry.type === 'Point',
            }),
          });
          geoJSON.addTo(map);
          if (fit) {
            map.fitBounds(geoJSON.getBounds(), {
              animate: false,
              noMoveStart: true,
              padding: [5, 5],
            });
          }
          break;
        case 'FIT_BOUNDS':
          map.fitBounds(data.payload, {
            padding: [5, 5],
          });
          break;
        case 'SET_EXTERNAL_ZOOM':
          map.setZoom(data.payload);
          break;

        case 'SET_EXTERNAL_CENTER':
          map.panTo(data.payload);
          break;

        case 'SET_EXTERNAL_VIEW':
          map.setView(data.payload.center, data.payload.zoom);
          break;
      }
    };
    window.addEventListener('message', handleMessage);

    postMessageToParent('ready', mapDetail);
    postMessageToParent('zoom', map.getZoom());

    map.on('zoom', () => {
      postMessageToParent('zoom', map.getZoom());
    });

    return () => {
      regions.forEach((region) => region.removeFrom(map));
      map.remove();
      worldTiles.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Box>
          <Box
            sx={{
              position: 'fixed',
              left: 7,
              top: 7,
              zIndex: 1,
            }}
          >
            <Button
              variant="default"
              component="a"
              href="https://aeternum-map.th.gl"
              target="_blank"
              leftIcon={<IconMap />}
              radius="xl"
            >
              Aeternum Map
            </Button>
          </Box>
          <Box
            sx={{
              width: '100vw',
              height: '100vh',
              background: '#859594 !important',
              zIndex: 0,
            }}
            ref={elementRef}
          />
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const root = createRoot(document.querySelector('#root')!);

root.render(
  <StrictMode>
    <External />
  </StrictMode>
);

initPlausible('-external');
