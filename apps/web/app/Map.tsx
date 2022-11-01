'use client';

import type { TileLayer } from 'leaflet';
import leaflet from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import 'tilelayer-canvas';
import { AETERNUM_MAP } from 'static';
import useSWR from 'swr';

function toThreeDigits(number: number): string {
  if (number < 10) {
    return `00${number}`;
  }
  if (number < 100) {
    return `0${number}`;
  }
  return `${number}`;
}

const worldCRS = leaflet.extend({}, leaflet.CRS.Simple, {
  transformation: new leaflet.Transformation(1 / 16, 0, -1 / 16, 0),
});

const WorldTiles = (map: string): new () => TileLayer =>
  // @ts-ignore
  leaflet.TileLayer.Canvas.extend({
    // options: {
    //   errorTileUrl: `${VITE_API_ENDPOINT}/assets/map/empty.webp`,
    // },
    getTileUrl(coords: { x: number; y: number; z: number }) {
      const zoom = 8 - coords.z - 1;
      const multiplicators = [1, 2, 4, 8, 16, 32, 64];
      const x = coords.x * multiplicators[zoom - 1];
      const y = (-coords.y - 1) * multiplicators[zoom - 1];
      if (x < 0 || y < 0 || y >= 64 || x >= 64) {
        return `https://aeternum-map.gg/assets/map/empty.webp`;
      }
      return `https://aeternum-map.gg/assets/${map}/map_l${zoom}_y${toThreeDigits(
        y
      )}_x${toThreeDigits(x)}.webp`;
    },
    getTileSize() {
      return { x: 1024, y: 1024 };
    },
  });

export let leafletMap: leaflet.Map | null = null;

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
const fetcher = (input: RequestInfo | URL, init?: RequestInit | undefined) =>
  fetch(input, init).then((res) => res.json());

export default function Map() {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const { data: data1 } = useSWR<LiveCharacter[]>(
    'https://live1.aeternum-map.gg/api/live',
    fetcher
  );
  const { data: data2 } = useSWR<LiveCharacter[]>(
    'https://live2.aeternum-map.gg/api/live',
    fetcher
  );

  const data = useMemo(
    () => data1 && data2 && [...data1, ...data2],
    [data1, data2]
  );
  useEffect(() => {
    const mapElement = elementRef.current;
    if (!mapElement || leafletMap || !data) {
      return;
    }
    const latLngBounds = leaflet.latLngBounds(AETERNUM_MAP.maxBounds);
    leafletMap = leaflet.map(mapElement, {
      preferCanvas: true,
      crs: worldCRS,
      maxZoom: AETERNUM_MAP.maxZoom,
      minZoom: AETERNUM_MAP.minZoom,
      attributionControl: false,
      zoomControl: false,
      zoom: 4,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
    });

    leafletMap.fitBounds(latLngBounds, { animate: false });

    const worldTiles = new (WorldTiles(AETERNUM_MAP.folder))();
    worldTiles.addTo(leafletMap);
    console.log(data);
    data.forEach(({ position }) => {
      const circle = leaflet.circle(
        [position.location[0], position.location[1]],
        { color: 'white' }
      );
      circle.addTo(leafletMap!);
    });
  }, [data]);

  return (
    <div
      ref={elementRef}
      style={{
        background: '#859594',
        height: '100vh',
      }}
    />
  );
}
