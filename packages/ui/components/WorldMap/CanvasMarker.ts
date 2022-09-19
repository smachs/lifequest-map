import leaflet from 'leaflet';
import type { MarkerSize } from 'static';

type CanvasMarkerOptions = {
  image: {
    size: [number, number];
    markerSize?: MarkerSize;
    showBackground: boolean;
    markerId: string;
    type: string;
    borderColor?: string;
    src: string;
    element?: HTMLImageElement;
    comments?: number;
    issues?: number;
    rotate?: number;
  };
};

const imageElements: {
  [src: string]: HTMLImageElement;
} = {};
class CanvasMarker extends leaflet.CircleMarker {
  declare options: leaflet.CircleMarkerOptions & CanvasMarkerOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _renderer: any;
  declare imageElement: HTMLImageElement;
  private _onImageLoad: (() => void) | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare _point: any;
  public actionHandle?: NodeJS.Timeout;
  public popup?: leaflet.Popup;

  constructor(
    latLng: leaflet.LatLngExpression,
    options: leaflet.CircleMarkerOptions & CanvasMarkerOptions
  ) {
    super(latLng, options);

    if (!imageElements[options.image.src]) {
      imageElements[options.image.src] = document.createElement('img');
      imageElements[options.image.src].src = options.image.src;
    }
    this.imageElement = imageElements[options.image.src];
  }

  _redraw(): void {
    return;
  }

  _update(): void {
    return;
  }

  _updatePath(): void {
    if (this.imageElement.complete) {
      this._renderer!._updateCanvasImg(this);
    } else if (!this._onImageLoad) {
      this._onImageLoad = () => {
        this.imageElement.removeEventListener('load', this._onImageLoad!);
        this._renderer!._updateCanvasImg(this);
      };
      this.imageElement.addEventListener('load', this._onImageLoad);
    }
  }
}

leaflet.Canvas.include({
  _updateCanvasImg(layer: CanvasMarker) {
    if (!layer.imageElement.complete) {
      return;
    }
    const ctx: CanvasRenderingContext2D = this._ctx;
    if (!ctx) {
      return;
    }
    const { image } = layer.options;
    const p = layer._point.round();
    const halfWidth = image.size[0] / 2;
    const halfHeight = halfWidth;
    const dx = p.x - halfWidth;
    const dy = p.y - halfHeight;
    if (image.showBackground) {
      ctx.beginPath();
      ctx.arc(dx + halfWidth, dy + halfHeight, halfWidth, 0, Math.PI * 2, true); // Outer circle
      ctx.fillStyle = 'rgba(30, 30, 30, 0.7)';
      ctx.fill();
      if (image.borderColor) {
        ctx.strokeStyle = image.borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    if (image.rotate) {
      ctx.save();

      ctx.translate(p.x, p.y);
      ctx.rotate((image.rotate * Math.PI) / 180);
      ctx.drawImage(
        layer.imageElement,
        -halfWidth,
        -halfHeight,
        image.size[0],
        image.size[1]
      );
      ctx.translate(-p.x, -p.y);
      ctx.restore();
    } else {
      ctx.drawImage(layer.imageElement, dx, dy, image.size[0], image.size[1]);
    }

    if (image.comments) {
      ctx.beginPath();
      ctx.arc(
        dx + image.size[0] - 8,
        dy + halfHeight - 8,
        3,
        0,
        Math.PI * 2,
        true
      ); // Outer circle
      ctx.fillStyle = '#3791F9';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
    if (image.issues) {
      ctx.beginPath();
      const offsetY = image.comments ? 4 : 0;
      ctx.arc(
        dx + image.size[0] - 8,
        dy + halfHeight - 8 + offsetY,
        3,
        0,
        Math.PI * 2,
        true
      ); // Outer circle
      ctx.fillStyle = '#ff5722';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
  },
});

export default CanvasMarker;
