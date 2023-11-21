import type { Coords, TileLayer } from 'leaflet';
import leaflet from 'leaflet';
import type { Map } from 'static';

const { VITE_API_ENDPOINT = '' } = import.meta.env;

type Tile = HTMLCanvasElement & { complete: boolean };

function toThreeDigits(number: number): string {
  if (number < 10) {
    return `00${number}`;
  }
  if (number < 100) {
    return `0${number}`;
  }
  return `${number}`;
}

const createCanvasLayer = (
  mapDetail: Map,
  isPTR: boolean
): new () => TileLayer =>
  leaflet.TileLayer.extend({
    _delays: {},
    _delaysForZoom: null,
    options: {
      minNativeZoom: mapDetail.minZoom,
      minZoom: -2,
      maxNativeZoom: mapDetail.maxZoom,
      maxZoom: mapDetail.maxZoom + 2,
    },
    getTileUrl(coords: Coords) {
      const zoom = 8 - coords.z - 1;
      const multiplicators = [1, 2, 4, 8, 16, 32, 64];
      const x = coords.x * multiplicators[zoom - 1];
      const y = (-coords.y - 1) * multiplicators[zoom - 1];
      if (x < 0 || y < 0 || y >= 64 || x >= 64) {
        return 'data:,';
      }
      return `${VITE_API_ENDPOINT}/assets/${isPTR ? 'ptr/' : ''}${
        mapDetail.folder
      }/map_l${zoom}_y${toThreeDigits(y)}_x${toThreeDigits(x)}.webp?v=4`;
    },
    getTileSize() {
      return { x: 1024, y: 1024 };
    },
    createCanvas: function (
      tile: Tile,
      coords: Coords,
      done: (err: unknown, tile: Tile) => void
    ) {
      let err: unknown;
      const ctx = tile.getContext('2d')!;
      const { doubleSize } = this.options;

      const { x: width, y: height } = this.getTileSize();
      tile.width = doubleSize ? width * 2 : width;
      tile.height = doubleSize ? height * 2 : height;

      const img = new Image();
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0);
          tile.complete = true;
        } catch (e) {
          err = e;
        } finally {
          done(err, tile);
        }
      };
      const tileZoom = this._getZoomForUrl();
      img.src = isNaN(tileZoom) ? '' : this.getTileUrl(coords);
      img.crossOrigin = 'anonymous';
    },
    createTile: function (coords: Coords, done: () => void) {
      const { timeout } = this.options;
      const { z: zoom } = coords;
      const tile = document.createElement('canvas');

      if (timeout) {
        if (zoom !== this._delaysForZoom) {
          this._clearDelaysForZoom();
          this._delaysForZoom = zoom;
        }

        if (!this._delays[zoom]) this._delays[zoom] = [];

        this._delays[zoom].push(
          setTimeout(() => {
            this.createCanvas(tile, coords, done);
          }, timeout)
        );
      } else {
        this.createCanvas(tile, coords, done);
      }

      return tile;
    },
    _clearDelaysForZoom: function () {
      const prevZoom = this._delaysForZoom;
      const delays = this._delays[prevZoom];

      if (!delays) return;

      delays.forEach((delay: number, index: number) => {
        clearTimeout(delay);
        delete delays[index];
      });

      delete this._delays[prevZoom];
    },
  });

export default createCanvasLayer;
