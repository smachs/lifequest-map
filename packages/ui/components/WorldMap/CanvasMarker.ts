import leaflet from 'leaflet';
import type { MarkerSize } from 'static';

type CanvasMarkerOptions = {
  radius: number;
  image: {
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
    highlight?: boolean;
    isTemporary?: boolean;
  };
  customRespawnTimer?: number;
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
  public customRespawnTimer?: number;

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
    this.customRespawnTimer = options.customRespawnTimer;
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
    const { image, radius } = layer.options;
    const p = layer._point.round();
    const imageSize = radius * 2;
    const dx = p.x - radius;
    const dy = p.y - radius;

    if (image.showBackground) {
      ctx.beginPath();
      ctx.arc(dx + radius, dy + radius, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(30, 30, 30, 0.7)';
      ctx.fill();
      if (image.borderColor) {
        ctx.strokeStyle = image.borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    if (image.highlight) {
      ctx.beginPath();
      ctx.arc(dx + radius, dy + radius, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (image.rotate) {
      ctx.save();

      ctx.translate(p.x, p.y);
      ctx.rotate((image.rotate * Math.PI) / 180);
      try {
        ctx.drawImage(
          layer.imageElement,
          -radius,
          -radius,
          imageSize,
          imageSize
        );
      } catch (error) {
        //
      }
      ctx.translate(-p.x, -p.y);
      ctx.restore();
    } else {
      try {
        ctx.drawImage(layer.imageElement, dx, dy, imageSize, imageSize);
      } catch (error) {
        //
      }
    }

    if (image.comments) {
      ctx.beginPath();
      ctx.arc(dx + imageSize - 8, dy + radius - 8, 3, 0, Math.PI * 2, true);
      ctx.fillStyle = '#3791F9';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
    if (image.issues) {
      ctx.beginPath();
      const offsetY = image.comments ? 4 : 0;
      ctx.arc(
        dx + imageSize - 8,
        dy + radius - 8 + offsetY,
        3,
        0,
        Math.PI * 2,
        true
      );
      ctx.fillStyle = '#ff5722';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
    if (image.isTemporary) {
      ctx.beginPath();
      let offsetY = 0;
      if (image.comments) {
        offsetY += 4;
      }
      if (image.issues) {
        offsetY += 4;
      }

      ctx.arc(
        dx + imageSize - 8,
        dy + radius - 8 + offsetY,
        3,
        0,
        Math.PI * 2,
        true
      );
      ctx.fillStyle = '#20C997';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }
  },
});

export default CanvasMarker;
