import type CanvasMarker from './CanvasMarker';

export function updateRotation(markers: CanvasMarker[], rotate: number) {
  if (markers.length === 0) {
    return;
  }
  markers.forEach((marker) => {
    marker.options.image.rotate = rotate;
    marker.redraw();
  });
}
