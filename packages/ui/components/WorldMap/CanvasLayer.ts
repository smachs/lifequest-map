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
      minZoom: 1,
      maxZoom: mapDetail.maxZoom,
      noWrap: true,
    },
    getTileUrl(coords: Coords) {
      const style = 'smachs/clpwjgjg100ww01p448s68cs5'; // streets
      const key =
        'pk.eyJ1Ijoic21hY2hzIiwiYSI6ImNqY2N2MmVkZjFiN2QzMmxsNDkyZWdtMHQifQ.rjpy2ydaboWELy4S_OIduw';
      return `https://api.mapbox.com/styles/v1/${style}/tiles/256/${coords.z}/${coords.x}/${coords.y}?access_token=${key}`;
    },
    getTileSize() {
      return { x: 256, y: 256 };
    },
    createCanvas: function (
      tile: Tile,
      coords: Coords,
      done: (err: unknown, tile: Tile) => void
    ) {
      let err: unknown;
      const ctx = tile.getContext('2d')!;
      const { x: width, y: height } = this.getTileSize();
      tile.width = width;
      tile.height = height;

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
