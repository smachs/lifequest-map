import { Box, Button } from '@mantine/core';
import { IconMap, IconMinus, IconPlus } from '@tabler/icons-react';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AETERNUM_MAP, findMapDetails, regions } from 'static';
import ErrorBoundary from 'ui/components/ErrorBoundary/ErrorBoundary';
import FadingBox from 'ui/components/FadingBox/FadingBox';
import createCanvasLayer from 'ui/components/WorldMap/CanvasLayer';
import { ThemeProvider } from 'ui/contexts/ThemeProvider';
import { initPlausible } from 'ui/utils/stats';
import './globals.css';

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

export default function External() {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<leaflet.Map | null>(null);

  useEffect(() => {
    const mapName =
      location.search.match(/map=([^&]+)/)?.[1] ?? 'NewWorld_VitaeEterna';
    const mapDetail = findMapDetails(mapName) ?? AETERNUM_MAP;
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

    map.fitBounds(latLngBounds, {
      animate: false,
      noMoveStart: true,
    });

    const CanvasLayer = createCanvasLayer(mapDetail);
    const worldTiles = new CanvasLayer();
    worldTiles.addTo(map);

    setMap(map);

    const regions = getRegions();

    regions.forEach((region) => region.addTo(map));

    let geoJSON: leaflet.GeoJSON | null = null;
    const handleMessage = (event: MessageEvent<any>) => {
      const data = event.data;
      switch (data.type) {
        case 'SET_EXTERNAL_DATA': {
          if (geoJSON) {
            geoJSON.remove();
          }
          geoJSON = leaflet.geoJSON(data.data, {
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
            style: (feature: any) => ({
              stroke: true,
              color: feature.properties['fill-outline-color'],
              fillColor: feature.properties['fill-color'],
              opacity: 1,
              fillOpacity: feature.properties['fill-opacity'],
              weight: 1,
            }),
          });
          geoJSON.bindTooltip((layer: any) => layer.feature.properties.title);
          geoJSON.addTo(map);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    window.parent.postMessage('aeternum-map-ready', '*');
    return () => {
      regions.forEach((region) => region.removeFrom(map));
      map.remove();
      worldTiles.remove();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Box>
          <FadingBox left={7} top={7} fadeFrom="top" noFade>
            <Button
              variant="default"
              component="a"
              href="https://aeternum-map.gg"
              target="_blank"
              leftIcon={<IconMap />}
              radius="xl"
            >
              Full Map
            </Button>
          </FadingBox>
          <FadingBox top="calc(50% - 26px)" right={12} fadeFrom="right" noFade>
            <Button.Group orientation="vertical">
              <Button
                compact
                variant="default"
                p={0}
                onClick={() => map!.zoomIn()}
                aria-label="Zoom in"
              >
                <IconPlus />
              </Button>
              <Button
                compact
                variant="default"
                p={0}
                onClick={() => map!.zoomOut()}
                aria-label="Zoom out"
              >
                <IconMinus />
              </Button>
            </Button.Group>
          </FadingBox>
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

initPlausible();
